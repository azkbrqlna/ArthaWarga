<?php

namespace App\Http\Controllers;

use App\Models\TagihanBulanan;
use App\Models\KategoriIuran;
use App\Models\HargaIuran; // Pastikan model ini di-import
use App\Models\PemasukanIuran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TagihanBulananController extends Controller
{
    // =========================================================================
    // AREA ADMIN (RT) - INPUT TAGIHAN & MONITORING
    // =========================================================================

    public function index_rt()
    {
        // Pastikan hanya Admin/RT yang bisa akses
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        // 1. Ambil semua data tagihan
        $tagihan = TagihanBulanan::with(['user', 'kategori'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get();

        // 2. HITUNG TOTAL KEUANGAN DARI TAGIHAN (di server)
        // a. Total Ditagihkan (Masih hutang atau menunggu verifikasi)
        $totalDitagihkan = $tagihan->whereIn('status', ['ditagihkan', 'pending'])->sum('nominal');

        // b. Total Lunas (Uang sudah diverifikasi masuk)
        $totalLunas = $tagihan->where('status', 'approved')->sum('nominal');

        // c. Total Jimpitan Terkumpul (Akumulasi Jimpitan dari tagihan yang sudah approved)
        $totalJimpitan = $tagihan->where('status', 'approved')->sum('jimpitan_air');

        return Inertia::render("TagihanBulanan/IndexRT", [
            'tagihan'         => $tagihan,
            'totalDitagihkan' => $totalDitagihkan,
            'totalLunas'      => $totalLunas,
            'totalJimpitan'   => $totalJimpitan, // Tambahan Jimpitan
        ]);
    }

    /**
     * FORM TAMBAH TAGIHAN (MANUAL)
     */
    public function create()
    {
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        
        if (!$kategoriAir) {
            return back()->with('error', 'Kategori Air tidak ditemukan di master data!');
        }

        $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first();

        if (!$masterHarga) {
            return back()->with('error', 'Konfigurasi harga Air belum disetting!');
        }

        $wargaList = User::where('role_id', 5)
            ->select('id', 'nm_lengkap', 'alamat')
            ->get()
            ->map(function ($user) {
                $lastTagihan = TagihanBulanan::where('usr_id', $user->id)
                    ->orderByDesc('tahun')
                    ->orderByDesc('bulan')
                    ->first();
                
                $user->last_meter = $lastTagihan ? $lastTagihan->mtr_skrg : 0;
                return $user;
            });

        return Inertia::render('TagihanBulanan/Create', [
            'wargaList'   => $wargaList,
            'masterHarga' => $masterHarga 
        ]);
    }

    /**
     * SIMPAN TAGIHAN (ADMIN INPUT)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'usr_id'       => 'required|exists:usr,id',
            'bulan'        => 'required|integer|min:1|max:12',
            'tahun'        => 'required|integer|min:2024',
            'mtr_bln_lalu' => 'required|integer|min:0',
            'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu',
            'pakai_sampah' => 'required|boolean',
        ]);

        $exists = TagihanBulanan::where('usr_id', $request->usr_id)
            ->where('bulan', $request->bulan)
            ->where('tahun', $request->tahun)
            ->exists();
        
        if ($exists) {
            return back()->withErrors(['usr_id' => 'Tagihan untuk warga ini di periode tersebut sudah ada.']);
        }

        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first() ?? $kategoriAir;

        $harga_meter = $masterHarga->harga_meteran ?? 0;
        $abonemen    = $masterHarga->abonemen ?? 0;
        $jimpitan    = $masterHarga->jimpitan_air ?? 0;
        $harga_sampah = $request->pakai_sampah ? ($masterHarga->harga_sampah ?? 0) : 0;

        $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
        $nominal   = ($pemakaian * $harga_meter) + $abonemen + $jimpitan + $harga_sampah;

        TagihanBulanan::create([
            'kat_iuran_id'  => $kategoriAir->id,
            'usr_id'        => $validated['usr_id'],
            'bulan'         => $validated['bulan'],
            'tahun'         => $validated['tahun'],
            'mtr_bln_lalu'  => $validated['mtr_bln_lalu'],
            'mtr_skrg'      => $validated['mtr_skrg'],
            'status'        => 'ditagihkan',
            'harga_meteran' => $harga_meter,
            'abonemen'      => $abonemen,
            'jimpitan_air'  => $jimpitan,
            'harga_sampah'  => $harga_sampah,
            'nominal'       => $nominal
        ]);

        return redirect()->route('tagihan.rt.index')->with('success', 'Tagihan berhasil dibuat!');
    }

    /**
     * APPROVAL RT (Function ini TIDAK DIPAKAI di IndexRT, tapi logikanya dipindah ke IndexRT)
     * Saya pertahankan fungsinya agar kode Anda tidak hilang, tapi tidak dipanggil oleh route monitoring utama.
     */
    public function approval_rt()
    {
        // Hitung Saldo Ditagihkan (Status: ditagihkan & pending)
        // Kita asumsikan 'pending' juga masih masuk kategori belum masuk kas (masih proses)

        $tagihan = TagihanBulanan::with(['user', 'kategori'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get();

        return Inertia::render("TagihanBulanan/Approval", [
            'tagihan'         => $tagihan,
        ]);
    }

    /**
     * APPROVE TAGIHAN (ADMIN)
     */
    public function approve($id)
    {
        $tagihan = TagihanBulanan::findOrFail($id);

        if ($tagihan->status === 'approved') {
            return back()->with('error', 'Tagihan sudah diapprove.');
        }

        $tagihan->update([
            'status' => 'approved',
            'tgl_approved' => now(),
        ]);

        $jimpitan = $tagihan->jimpitan_air ?? 0;

        if ($jimpitan > 0) {
            PemasukanIuran::create([
                'usr_id'       => $tagihan->usr_id,
                'kat_iuran_id' => $tagihan->kat_iuran_id, 
                'tgl'          => now(),
                'nominal'      => $jimpitan,
                'ket'          => 'Jimpitan Air (Auto) - ' . $tagihan->bulan . '/' . $tagihan->tahun,
                'status'       => 'approved',
            ]);
        }

        return back()->with('success', 'Tagihan disetujui. Dana Jimpitan masuk kas.');
    }

    public function decline($id)
    {
        $tagihan = TagihanBulanan::findOrFail($id);
        $tagihan->status = 'ditagihkan';
        $tagihan->save();

        return back()->with('success', 'Tagihan ditolak.');
    }
    
    public function edit($id)
    {
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        $tagihan = TagihanBulanan::findOrFail($id);
        
        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        $masterHarga = null;
        if ($kategoriAir) {
            $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first();
        }

        if (!$masterHarga) {
            return back()->with('error', 'Master harga iuran belum disetting di menu Master Data!');
        }

        $wargaList = User::where('role_id', 5)->select('id', 'nm_lengkap', 'alamat')->get();

        return Inertia::render('TagihanBulanan/Edit', [
            'tagihan'     => $tagihan,
            'wargaList'   => $wargaList,
            'masterHarga' => $masterHarga
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'usr_id'       => 'required|exists:usr,id',
            'bulan'        => 'required|integer|min:1|max:12',
            'tahun'        => 'required|integer|min:2024',
            'mtr_bln_lalu' => 'required|integer|min:0',
            'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu',
            'pakai_sampah' => 'required|boolean',
        ]);

        $tagihan = TagihanBulanan::findOrFail($id);

        $h_meter    = $tagihan->harga_meteran;
        $h_abo      = $tagihan->abonemen;
        $h_jimpitan = $tagihan->jimpitan_air;
        
        if ($validated['pakai_sampah']) {
            $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
            $masterNow = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first();
            
            $h_sampah = $tagihan->harga_sampah > 0 ? $tagihan->harga_sampah : ($masterNow->harga_sampah ?? 15000);
        } else {
            $h_sampah = 0;
        }

        $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
        $nominal   = ($pemakaian * $h_meter) + $h_abo + $h_jimpitan + $h_sampah;

        $tagihan->update([
            'usr_id'       => $validated['usr_id'],
            'bulan'        => $validated['bulan'],
            'tahun'        => $validated['tahun'],
            'mtr_bln_lalu' => $validated['mtr_bln_lalu'],
            'mtr_skrg'     => $validated['mtr_skrg'],
            'harga_sampah' => $h_sampah,
            'nominal'      => $nominal
        ]);

        return redirect()->route('tagihan.rt.index')->with('success', 'Data tagihan berhasil diperbarui.');
    }

    public function destroy($id)
    {
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);
        
        try {
            $tagihan = TagihanBulanan::findOrFail($id);
            $tagihan->delete();
            return redirect()->route('tagihan.rt.index')->with('success', 'Tagihan berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->route('tagihan.rt.index')->with('error', 'Gagal menghapus tagihan: ' . $e->getMessage());
        }
    }

    // ... Function Warga (index_warga, show_warga, upload_bukti) tetap sama ...
    

    // =========================================================================
    // AREA WARGA - LIHAT & UPLOAD BUKTI
    // =========================================================================

    public function index_warga()
    {
        $tagihan = TagihanBulanan::with(['user', 'kategori'])
            ->where('usr_id', Auth::id())
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get();

        return Inertia::render("TagihanBulanan/IndexWarga", [
            'tagihan' => $tagihan
        ]);
    }

    public function show_warga($id)
    {
        $data = TagihanBulanan::with(['user', 'kategori'])->findOrFail($id);

        if ($data->usr_id !== Auth::id()) abort(403);

        return Inertia::render("TagihanBulanan/ShowWarga", [
            'tagihan' => $data
        ]);
    }

    /**
     * UPLOAD BUKTI BAYAR (WARGA)
     * Menggantikan fungsi bayar() yang lama. Sekarang hanya upload.
     */
    public function upload_bukti(Request $request)
    {
        $validated = $request->validate([
            'id'       => 'required|integer|exists:tagihan_bulanan,id', // ID Tagihan
            'bkt_byr'  => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $userId = Auth::id();
        $targetTagihan = TagihanBulanan::findOrFail($validated['id']);

        // Security Check: Pastikan yang upload adalah pemilik tagihan
        if ($targetTagihan->usr_id !== $userId) {
            abort(403, 'Akses ditolak.');
        }

        // Proses Upload
        if ($request->hasFile('bkt_byr')) {
            $file = $request->file('bkt_byr');
            // Nama file unik: Ymd_His_IDTagihan.ext
            $filename = now()->format('Ymd_His') . '_' . $targetTagihan->id . '_bktbyr.' . $file->getClientOriginalExtension();
            $targetTagihan->bkt_byr = $file->storeAs('bukti_air', $filename, 'public');
        }

        // Update Status & Tanggal Bayar
        $targetTagihan->tgl_byr = now();
        $targetTagihan->status  = 'pending';
        $targetTagihan->save();

        return redirect()->route('tagihan.warga.index')->with('success', 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.');
    }
}
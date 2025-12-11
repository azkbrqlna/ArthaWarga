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
    // ... function index_rt, store, dll tetap sama ...

    public function index_rt()
    {
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        $tagihan = TagihanBulanan::with(['user', 'kategori'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get();

        return Inertia::render("TagihanBulanan/IndexRT", [
            'tagihan' => $tagihan
        ]);
    }

    /**
     * FORM TAMBAH TAGIHAN (MANUAL)
     */
    public function create()
    {
        // 1. Cek Hak Akses Admin
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        // 2. Ambil Master Harga Air
        // Cari kategori dengan nama 'Air'
        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        
        if (!$kategoriAir) {
            return back()->with('error', 'Kategori Air tidak ditemukan di master data!');
        }

        // Ambil harga dari tabel harga_iuran yang berelasi
        $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first();

        // Fallback jika belum disetting di tabel harga_iuran, tapi ada di tabel kat_iuran (legacy)
        if (!$masterHarga) {
             // Jika Anda masih pakai struktur lama di kat_iuran, pakai ini:
             $masterHarga = $kategoriAir; 
             // Tapi sebaiknya pastikan data ada di HargaIuran sesuai referensi controller Anda.
        }

        if (!$masterHarga) {
            return back()->with('error', 'Konfigurasi harga Air belum disetting!');
        }

        // 3. Ambil Data Warga
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

    public function store(Request $request)
    {
        // Validasi
        $validated = $request->validate([
            'usr_id'       => 'required|exists:usr,id',
            'bulan'        => 'required|integer|min:1|max:12',
            'tahun'        => 'required|integer|min:2024',
            'mtr_bln_lalu' => 'required|integer|min:0',
            'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu',
            'pakai_sampah' => 'required|boolean',
        ]);

        // Cek Duplikat
        $exists = TagihanBulanan::where('usr_id', $request->usr_id)
            ->where('bulan', $request->bulan)
            ->where('tahun', $request->tahun)
            ->exists();
        
        if ($exists) {
            return back()->withErrors(['usr_id' => 'Tagihan untuk warga ini di periode tersebut sudah ada.']);
        }

        // Ambil Harga Snapshot (Sama logic dengan create)
        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first() ?? $kategoriAir;

        // Gunakan Null Coalescing (?? 0) agar aman
        $harga_meter = $masterHarga->harga_meteran ?? 0;
        $abonemen    = $masterHarga->abonemen ?? 0;
        $jimpitan    = $masterHarga->jimpitan_air ?? 0;
        $harga_sampah = $request->pakai_sampah ? ($masterHarga->harga_sampah ?? 0) : 0;

        // Hitung Nominal
        $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
        $nominal   = ($pemakaian * $harga_meter) + $abonemen + $jimpitan + $harga_sampah;

        TagihanBulanan::create([
            'kat_iuran_id'  => $kategoriAir->id, // ID Kategori tetap mengacu ke master kategori
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
     * MONITORING TAGIHAN (INDEX RT)
     */
    /**
     * MONITORING TAGIHAN (INDEX RT)
     */
    public function approval_rt()
    {
        // Hitung Saldo Ditagihkan (Status: ditagihkan & pending)
        // Kita asumsikan 'pending' juga masih masuk kategori belum masuk kas (masih proses)
        $totalDitagihkan = TagihanBulanan::whereIn('status', ['ditagihkan', 'pending'])
            ->sum('nominal');

        // Hitung Saldo Lunas (Status: approved)
        $totalLunas = TagihanBulanan::where('status', 'approved')
            ->sum('nominal');

        $tagihan = TagihanBulanan::with(['user', 'kategori'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get();

        return Inertia::render("TagihanBulanan/Approval", [
            'tagihan'         => $tagihan,
            'totalDitagihkan' => $totalDitagihkan, // Kirim ke Frontend
            'totalLunas'      => $totalLunas       // Kirim ke Frontend
        ]);
    }

    /**
     * APPROVE TAGIHAN (ADMIN)
     * Logika: Update status & Masukkan Jimpitan ke Kas
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
                'kat_iuran_id' => '5', // Asumsi ID Kategori Jimpitan adalah 3
                'tgl'          => now(),
                'nominal'      => $jimpitan, // Hanya nominal jimpitan yg masuk kas
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
/**
     * HALAMAN EDIT TAGIHAN
     */
    public function edit($id)
    {
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        $tagihan = TagihanBulanan::findOrFail($id);
        
        // --- PERBAIKAN DI SINI ---
        // 1. Cari dulu ID kategori 'Air'
        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        
        // 2. Ambil harga dari tabel 'harga_iuran' berdasarkan ID kategori tsb
        // (Gunakan where 'kat_iuran_id', bukan id)
        $masterHarga = null;
        if ($kategoriAir) {
            $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first();
        }

        // Fallback jika belum ada settingan harga
        if (!$masterHarga) {
            return back()->with('error', 'Master harga iuran belum disetting di menu Master Data!');
        }
        // -------------------------

        $wargaList = User::where('role_id', 5)->select('id', 'nm_lengkap', 'alamat')->get();

        return Inertia::render('TagihanBulanan/Edit', [
            'tagihan'     => $tagihan,
            'wargaList'   => $wargaList,
            'masterHarga' => $masterHarga
        ]);
    }

    /**
     * PROSES UPDATE TAGIHAN
     */
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

        // Ambil harga dari snapshot lama (agar harga tidak berubah mengikuti master baru)
        // ATAU ambil dari master jika ingin update harga mengikuti master saat ini.
        // Di sini saya pakai logika: Update meteran, tapi harga satuan tetap pakai snapshot lama (fairness).
        
        $h_meter    = $tagihan->harga_meteran;
        $h_abo      = $tagihan->abonemen;
        $h_jimpitan = $tagihan->jimpitan_air;
        
        // Logic Sampah: Jika status berubah jadi pakai, ambil harga snapshot atau master
        if ($validated['pakai_sampah']) {
            $h_sampah = $tagihan->harga_sampah > 0 ? $tagihan->harga_sampah : ($tagihan->kategori->harga_sampah ?? 15000);
        } else {
            $h_sampah = 0;
        }

        // Hitung Ulang Nominal
        $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
        $nominal   = ($pemakaian * $h_meter) + $h_abo + $h_jimpitan + $h_sampah;

        $tagihan->update([
            'usr_id'       => $validated['usr_id'], // In case admin salah pilih orang
            'bulan'        => $validated['bulan'],
            'tahun'        => $validated['tahun'],
            'mtr_bln_lalu' => $validated['mtr_bln_lalu'],
            'mtr_skrg'     => $validated['mtr_skrg'],
            'harga_sampah' => $h_sampah,
            'nominal'      => $nominal
        ]);

        return redirect()->route('tagihan.rt.index')->with('success', 'Data tagihan berhasil diperbarui.');
    }

    /**
     * HAPUS TAGIHAN
     */
public function destroy($id)
    {
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);
        
        try {
            $tagihan = TagihanBulanan::findOrFail($id);
            $tagihan->delete();

            // PENTING: Redirect ke route index, bukan back()
            return redirect()->route('tagihan.rt.index')->with('success', 'Tagihan berhasil dihapus.');
            
        } catch (\Exception $e) {
            // Tangkap error jika gagal hapus (misal ada foreign key constraint)
            return redirect()->route('tagihan.rt.index')->with('error', 'Gagal menghapus tagihan: ' . $e->getMessage());
        }
    }

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
<?php

namespace App\Http\Controllers;

use App\Models\TagihanBulanan;
use App\Models\KategoriIuran;
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

    /**
     * FORM TAMBAH TAGIHAN (MANUAL)
     */
    public function create()
    {
        // 1. Cek Hak Akses Admin
        if (!in_array(Auth::user()->role_id, [1, 2])) abort(403);

        // 2. Ambil Master Harga Air (Untuk referensi hitungan di Frontend)
        $masterHarga = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        if (!$masterHarga) return back()->with('error', 'Master data harga Air belum disetting!');

        // 3. Ambil Data Warga + Info Meteran Terakhirnya (Logic Opsi A: Autofill Instan)
        // Kita "tempelkan" data last_meter ke setiap user agar frontend bisa autofill
        $wargaList = User::where('role_id', 5) // Mengambil warga (Role 5)
            ->select('id', 'nm_lengkap', 'alamat')
            ->get()
            ->map(function ($user) {
                // Cari tagihan terakhir user ini
                $lastTagihan = TagihanBulanan::where('usr_id', $user->id)
                    ->orderByDesc('tahun')
                    ->orderByDesc('bulan')
                    ->first();
                
                // Jika ada, ambil meteran sekarangnya sebagai meteran awal bulan ini. Jika tidak, 0.
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
        // 1. Validasi Input Admin
        $validated = $request->validate([
            'usr_id'       => 'required|exists:usr,id',
            'bulan'        => 'required|integer|min:1|max:12',
            'tahun'        => 'required|integer|min:2024',
            'mtr_bln_lalu' => 'required|integer|min:0',
            'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu',
            'pakai_sampah' => 'required|boolean', // Dropdown Ya/Tidak
        ]);

        // 2. Cek Duplikat Tagihan
        $exists = TagihanBulanan::where('usr_id', $request->usr_id)
            ->where('bulan', $request->bulan)
            ->where('tahun', $request->tahun)
            ->exists();
        
        if ($exists) {
            return back()->withErrors(['usr_id' => 'Tagihan untuk warga ini di periode tersebut sudah ada.']);
        }

        // 3. Ambil Snapshot Harga (PENTING: Hitung di Server agar aman)
        $kategori = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        
        $harga_meter = $kategori->harga_meteran ?? 0;
        $abonemen    = $kategori->abonemen ?? 0;
        $jimpitan    = $kategori->jimpitan_air ?? 0;
        
        // Cek apakah pakai sampah
        $harga_sampah = $request->pakai_sampah ? ($kategori->harga_sampah ?? 0) : 0;

        // 4. Hitung Nominal Final
        $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
        $nominal   = ($pemakaian * $harga_meter) + $abonemen + $jimpitan + $harga_sampah;

        // 5. Simpan ke Database
        TagihanBulanan::create([
            'kat_iuran_id'  => $kategori->id,
            'usr_id'        => $validated['usr_id'],
            'bulan'         => $validated['bulan'],
            'tahun'         => $validated['tahun'],
            'mtr_bln_lalu'  => $validated['mtr_bln_lalu'],
            'mtr_skrg'      => $validated['mtr_skrg'],
            'status'        => 'ditagihkan',
            
            // Simpan Snapshot Harga
            'harga_meteran' => $harga_meter,
            'abonemen'      => $abonemen,
            'jimpitan_air'  => $jimpitan,
            'harga_sampah'  => $harga_sampah, // 0 jika tidak pilih sampah, atau nominal jika pilih
            'nominal'       => $nominal
        ]);

        return redirect()->route('tagihan.monitoring')->with('success', 'Tagihan berhasil dibuat!');
    }

    /**
     * MONITORING TAGIHAN (INDEX RT)
     */
    public function index_rt()
    {
        $tagihan = TagihanBulanan::with(['user', 'kategori'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->get();

        return Inertia::render("TagihanBulanan/IndexRT", [
            'tagihan' => $tagihan
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

        // 1. Update Status Tagihan
        $tagihan->update([
            'status' => 'approved',
            'tgl_approved' => now(),
        ]);

        // 2. MASUKKAN JIMPITAN KE TABEL PEMASUKAN_IURAN (Kas RT)
        // Ambil nominal jimpitan yang tersimpan di snapshot
        $jimpitan = $tagihan->jimpitan_air ?? 0;

        if ($jimpitan > 0) {
            PemasukanIuran::create([
                'usr_id'       => $tagihan->usr_id,
                'kat_iuran_id' => $tagihan->kat_iuran_id, 
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
        $tagihan->status = 'declined';
        $tagihan->save();

        return back()->with('success', 'Tagihan ditolak.');
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

        return redirect()->back()
            ->with('success', 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.');
    }
}
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
    /**
     * GENERATE TAGIHAN BULANAN (RT)
     */
    public function generate()
    {
        // 1. Cek User adalah RT (Role 1) atau Sekretaris (Role 2)
        $userAuth = Auth::user();
        if (!in_array($userAuth->role_id, [1, 2])) {
            abort(403, "Hanya pengurus RT yang dapat membuat tagihan.");
        }

        $bulan = now()->month;
        $tahun = now()->year;

        // 2. Ambil Kategori "AIR"
        $kategori = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        if (!$kategori) return back()->with('error', 'Kategori AIR tidak ditemukan di Master Data!');

        // 3. Ambil List Warga (Role 5) sesuai request terakhir
        $wargaList = User::where('role_id', 5)->get(); 

        $count = 0;
        foreach ($wargaList as $warga) {
            // Cek duplikat tagihan bulan ini
            $cek = TagihanBulanan::where('usr_id', $warga->id)
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->first();

            if ($cek) continue;

            // OTOMATIS: Ambil meteran bulan lalu dari tagihan terakhir
            $tagihanLalu = TagihanBulanan::where('usr_id', $warga->id)
                ->orderByDesc('tahun')
                ->orderByDesc('bulan')
                ->first();
            
            // Kalau warga baru/belum pernah ada tagihan, meteran lalu = 0
            $mtr_lalu = $tagihanLalu ? $tagihanLalu->mtr_skrg : 0;

            // CREATE TAGIHAN dengan SNAPSHOT HARGA LENGKAP
            TagihanBulanan::create([
                'kat_iuran_id'    => $kategori->id,
                'usr_id'          => $warga->id,
                'bulan'           => $bulan,
                'tahun'           => $tahun,
                'mtr_bln_lalu'    => $mtr_lalu,
                'mtr_skrg'        => null,
                'status'          => 'ditagihkan',
                
                // SNAPSHOT HARGA
                'harga_meteran'   => $kategori->harga_meteran,
                'abonemen'        => $kategori->abonemen,
                'jimpitan_air'    => $kategori->jimpitan_air,
                'harga_sampah'    => null, 
                'nominal'         => null
            ]);
            $count++;
        }

        return back()->with('success', "Berhasil membuat $count tagihan air.");
    }

    /**
     * WARGA - LIHAT LIST TAGIHAN
     */
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

    /**
     * WARGA - HALAMAN BAYAR
     */
    public function show_warga($id)
    {
        $data = TagihanBulanan::with(['user', 'kategori'])->findOrFail($id);

        if ($data->usr_id !== Auth::id()) abort(403);

        return Inertia::render("TagihanBulanan/ShowWarga", [
            'tagihan' => $data
        ]);
    }

    /**
     * WARGA - PROSES BAYAR
     */
    public function bayar(Request $request)
    {
        $request->validate([
            'id'           => 'required|exists:tagihan_bulanan,id',
            'mtr_bln_lalu' => 'required|integer|min:0', // Validasi input meteran awal
            'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu', // Harus >= bulan lalu
            'bayar_sampah' => 'nullable|boolean',
            'bkt_byr'      => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ], [
            'mtr_skrg.gte' => 'Meteran saat ini tidak boleh lebih kecil dari meteran bulan lalu.'
        ]);

        $tagihan = TagihanBulanan::with('kategori')->findOrFail($request->id);
        if ($tagihan->usr_id != Auth::id()) abort(403);

        // UPDATE DATABASE: Simpan inputan warga (Lalu & Sekarang)
        $tagihan->mtr_bln_lalu = $request->mtr_bln_lalu;
        $tagihan->mtr_skrg = $request->mtr_skrg;

        // --- HITUNG NOMINAL ---
        // Prioritas ambil dari SNAPSHOT (di tabel tagihan), kalau null baru ambil master
        $h_meter    = $tagihan->harga_meteran ?? $tagihan->kategori->harga_meteran ?? 0;
        $h_abo      = $tagihan->abonemen      ?? $tagihan->kategori->abonemen      ?? 0;
        $h_jimpitan = $tagihan->jimpitan_air  ?? $tagihan->kategori->jimpitan_air  ?? 0;

        $pemakaian = $tagihan->mtr_skrg - $tagihan->mtr_bln_lalu;
        
        // Rumus: (Pemakaian x Harga) + Abonemen + Jimpitan
        $nominal = ($pemakaian * $h_meter) + $h_abo + $h_jimpitan;

        // Cek Sampah
        if ($request->filled('bayar_sampah') && $request->bayar_sampah == true) {
            $h_sampah = $tagihan->kategori->harga_sampah ?? 0;
            $tagihan->harga_sampah = $h_sampah; 
            $nominal += $h_sampah;
        } else {
            $tagihan->harga_sampah = 0;
        }

        $tagihan->nominal = $nominal;

        // Upload Bukti
        if ($request->hasFile('bkt_byr')) {
            $file = $request->file('bkt_byr');
            $name = now()->format('Ymd_His') . "_" . $tagihan->id . "." . $file->getClientOriginalExtension();
            $tagihan->bkt_byr = $file->storeAs("bukti_air", $name, "public");
        }

        $tagihan->tgl_byr = now();
        $tagihan->status = 'pending';
        $tagihan->save();

        return back()->with('success', 'Pembayaran terkirim. Menunggu verifikasi.');
    }

    /**
     * RT - LIHAT LIST TAGIHAN
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
     * RT - APPROVE TAGIHAN
     * Di sini uang jimpitan masuk ke Kas Iuran
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
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function header(Request $request)
    {
        // 1. Ambil user dari token
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'error' => 'User tidak ditemukan'
            ], 404);
        }

        // 2. Ambil Data Wilayah User
        $rt = $user->rt;
        $rw = $user->rw;

        // Ambil nama wilayah via FK
        $kel = DB::table('kelurahan')->where('id', $user->kelurahan_id)->first();
        $kec = DB::table('kecamatan')->where('id', $user->kecamatan_id)->first();
        $kota = DB::table('kota')->where('id', $user->kota_id)->first();

        // 3. Tangkap Input Filter (Tahun & Bulan)
        $tahun = $request->input('tahun', now()->year);
        $bulan = $request->input('bulan'); // 1 - 12 (Bisa null)

        // --- LOGIKA 1: HITUNG SALDO AWAL ---
        
        $saldoAwal = 0;

        // A. Query Pemasukan Sebelumnya
        // PERUBAHAN: Menghapus filter 'status' karena tidak ada kolom tersebut di image_e9689f.jpg
        $prevMasuk = DB::table('masuk_iuran')
            ->whereYear('tgl', $tahun);

        // B. Query Pengeluaran Sebelumnya
        $prevKeluar = DB::table('pengeluaran')
            ->whereYear('tgl', $tahun);

        if ($bulan) {
            // Jika filter bulan aktif, hitung transaksi SEBELUM bulan tersebut
            $prevMasuk->whereMonth('tgl', '<', $bulan);
            $prevKeluar->whereMonth('tgl', '<', $bulan);
        } else {
            // Jika setahun penuh, tidak perlu hitung saldo awal (set query jadi false)
            $prevMasuk->whereRaw('1 = 0'); 
            $prevKeluar->whereRaw('1 = 0');
        }

        $totalMasukDulu = $prevMasuk->sum('nominal'); 
        $totalKeluarDulu = $prevKeluar->sum('nominal'); 

        $saldoAwal = $totalMasukDulu - $totalKeluarDulu;

        // --- LOGIKA 2: AMBIL DATA TRANSAKSI UTAMA ---

        // A. Pemasukan (Query Utama)
        // PERUBAHAN: Menghapus filter 'status' -> Semua data dianggap approved/valid
        $pemasukan = DB::table('masuk_iuran')
            ->leftJoin('kat_iuran', 'masuk_iuran.kat_iuran_id', '=', 'kat_iuran.id')
            ->whereYear('masuk_iuran.tgl', $tahun)
            ->select(
                'masuk_iuran.tgl as tanggal',
                // Pastikan 'nm_kat' benar. Jika error unknown column, ganti jadi 'nama_kategori' atau 'nama'
                DB::raw("COALESCE(kat_iuran.nm_kat, 'Iuran Warga') as kategori"),
                'masuk_iuran.nominal as pemasukan',
                DB::raw('0 as pengeluaran'),
                'masuk_iuran.ket as keterangan'
            );

        // B. Pengeluaran (Query Utama)
        $pengeluaran = DB::table('pengeluaran')
            ->whereYear('tgl', $tahun)
            ->select(
                'tgl as tanggal', 
                DB::raw("'Pengeluaran Operasional' as kategori"),
                DB::raw('0 as pemasukan'),
                'nominal as pengeluaran', 
                'ket as keterangan'
            );

        // C. Terapkan Filter Bulan
        if ($bulan) {
            $pemasukan->whereMonth('masuk_iuran.tgl', $bulan);
            $pengeluaran->whereMonth('tgl', $bulan);
        }

        // D. Gabungkan & Urutkan
        $transaksi = $pemasukan->unionAll($pengeluaran)
            ->orderBy('tanggal', 'asc')
            ->get();

        // --- LOGIKA 3: LOOPING SALDO BERJALAN ---
        $dataTabel = [];
        $saldoBerjalan = $saldoAwal; 

        foreach ($transaksi as $item) {
            $jumlahAwalRow = $saldoBerjalan;
            $masuk = intval($item->pemasukan);
            $keluar = intval($item->pengeluaran);
            
            $saldoBerjalan = $saldoBerjalan + $masuk - $keluar;

            $dataTabel[] = [
                'tanggal'     => $item->tanggal,
                'kategori'    => $item->kategori,
                'jumlah_awal' => $jumlahAwalRow,
                'pemasukan'   => $masuk,
                'pengeluaran' => $keluar,
                'saldo_akhir' => $saldoBerjalan,
                'keterangan'  => $item->keterangan ?? '-',
                'bukti_nota'  => '-'
            ];
        }

        // Setup Label Periode
        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        $labelPeriode = $bulan ? ($namaBulan[$bulan] . ' ' . $tahun) : ('Tahun ' . $tahun);

        return response()->json([
            'tanggal_cetak' => now()->format('d-m-Y H:i:s'),
            'dicetak_oleh'  => $user->nm_lengkap,
            'rt'            => $rt,
            'rw'            => $rw,
            'kelurahan'     => $kel->nama_kelurahan ?? null,
            'kecamatan'     => $kec->nama_kecamatan ?? null,
            'kota'          => $kota->nama_kota ?? null,
            'periode'       => $labelPeriode,
            'data_keuangan' => $dataTabel
        ]);
    }
}
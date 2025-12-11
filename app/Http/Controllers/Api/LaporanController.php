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
            return response()->json(['error' => 'User tidak ditemukan'], 404);
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

        // --- LOGIKA 1: HITUNG SALDO AWAL (Gabungan Iuran + BOP - Pengeluaran) ---
        
        $saldoAwal = 0;

        // A. Saldo dari Iuran (Sebelum periode)
        $prevIuran = DB::table('masuk_iuran')->whereYear('tgl', $tahun);
        
        // B. Saldo dari BOP (Sebelum periode) -> INI BARU DITAMBAHKAN
        // Mengambil data dari tabel masuk_bop
        $prevBop = DB::table('masuk_bop')->whereYear('tgl', $tahun);

        // C. Saldo Keluar (Sebelum periode)
        $prevKeluar = DB::table('pengeluaran')->whereYear('tgl', $tahun);

        if ($bulan) {
            // Jika filter bulan aktif, hitung transaksi SEBELUM bulan tersebut
            $prevIuran->whereMonth('tgl', '<', $bulan);
            $prevBop->whereMonth('tgl', '<', $bulan);
            $prevKeluar->whereMonth('tgl', '<', $bulan);
        } else {
            // Setahun penuh, saldo awal hitungan 0 (kecuali ada logika saldo tahun lalu)
            $prevIuran->whereRaw('1 = 0');
            $prevBop->whereRaw('1 = 0');
            $prevKeluar->whereRaw('1 = 0');
        }

        $totalMasuk = $prevIuran->sum('nominal') + $prevBop->sum('nominal');
        $totalKeluar = $prevKeluar->sum('nominal');

        $saldoAwal = $totalMasuk - $totalKeluar;

        // --- LOGIKA 2: AMBIL DATA TRANSAKSI UTAMA ---

        // 1. Pemasukan Iuran (Tabel: masuk_iuran)
        $queryIuran = DB::table('masuk_iuran')
            ->leftJoin('kat_iuran', 'masuk_iuran.kat_iuran_id', '=', 'kat_iuran.id')
            ->whereYear('masuk_iuran.tgl', $tahun)
            ->select(
                'masuk_iuran.tgl as tanggal',
                // Mengambil nama kategori dari tabel relasi
                DB::raw("COALESCE(kat_iuran.nm_kat, 'Iuran Warga') as kategori"),
                'masuk_iuran.nominal as pemasukan',
                DB::raw('0 as pengeluaran'),
                'masuk_iuran.ket as keterangan',
                DB::raw("'-' as bukti_nota") // Iuran tidak ada nota di screenshot
            );

        // 2. Pemasukan BOP (Tabel: masuk_bop) -> INI BARU DITAMBAHKAN
        // Sesuai screenshot image_6e52e4.jpg, kolomnya adalah tgl, nominal, ket, bkt_nota
        $queryBop = DB::table('masuk_bop')
            ->whereYear('tgl', $tahun)
            ->select(
                'tgl as tanggal',
                DB::raw("'Dana BOP' as kategori"), // Label kategori manual untuk BOP
                'nominal as pemasukan',
                DB::raw('0 as pengeluaran'),
                'ket as keterangan',
                'bkt_nota as bukti_nota' // BOP ada nota
            );

        // 3. Pengeluaran (Tabel: pengeluaran)
        $queryPengeluaran = DB::table('pengeluaran')
            ->whereYear('tgl', $tahun)
            ->select(
                'tgl as tanggal', 
                DB::raw("'Pengeluaran Operasional' as kategori"),
                DB::raw('0 as pemasukan'),
                'nominal as pengeluaran', 
                'ket as keterangan',
                'bkt_nota as bukti_nota'
            );

        // Terapkan Filter Bulan pada ketiga query
        if ($bulan) {
            $queryIuran->whereMonth('masuk_iuran.tgl', $bulan);
            $queryBop->whereMonth('tgl', $bulan);
            $queryPengeluaran->whereMonth('tgl', $bulan);
        }

        // --- GABUNGKAN SEMUA (UNION) ---
        // Urutan Union: Iuran + BOP + Pengeluaran
        $transaksi = $queryIuran
            ->unionAll($queryBop)
            ->unionAll($queryPengeluaran)
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
                'bukti_nota'  => $item->bukti_nota ?? '-'
            ];
        }

        // Setup Label Periode
        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
            7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        $labelPeriode = $bulan ? ($namaBulan[$bulan] . ' ' . $tahun) : ('Tahun ' . $tahun);

        // 4. Return Response JSON
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
<?php

namespace App\Http\Controllers\Api;

use App\Models\PemasukanBOP;
use App\Models\Pengeluaran;
use App\Models\PemasukanIuran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Http\Controllers\Controller; 

class DashboardApiController extends Controller
{
    /**
     * Lihat ringkasan saldo
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSummary()
    {
        // 7️⃣ RINGKASAN SALDO GLOBAL
        $totalBop = PemasukanBOP::sum('nominal');
        $totalIuran = PemasukanIuran::sum('nominal'); // Iuran tanpa status approved
        $totalPengeluaran = Pengeluaran::sum('nominal');
        
        // Pengeluaran per kategori
        $totalPengeluaranBop = Pengeluaran::whereNotNull('masuk_bop_id')->sum('nominal');
        $totalPengeluaranIuran = Pengeluaran::whereNotNull('masuk_iuran_id')->sum('nominal');

        $userTotal = User::count();
        
        // Perhitungan Sisa Saldo
        $sisaBop = $totalBop - $totalPengeluaranBop;
        $sisaIuran = $totalIuran - $totalPengeluaranIuran;
        $sisaSaldoGlobal = $sisaBop + $sisaIuran; // Total Sisa Saldo

        return response()->json([
            'saldoAwal' => $totalBop + $totalIuran, // Total Pemasukan
            'sisaSaldo' => $sisaSaldoGlobal,
            'totalPengeluaran' => $totalPengeluaran,
            'userTotal' => $userTotal,
            'sisaBop' => $sisaBop,
            'sisaIuran' => $sisaIuran,
        ]);
    }


    /**
     * Lihat data transaksi (filter tanggal)
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTimeline(Request $request)
    {
        $selectedDate = $request->input('date');

        // --- 1. AMBIL DAN FORMAT DATA TRANSAKSI ---

        // 1️⃣ BOP Masuk
        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->when($selectedDate, fn($query) => $query->whereDate('tgl', $selectedDate))
            ->get()
            ->map(fn($row) => [
                'id' => 'bop-in-'.$row->id,
                'real_id' => $row->id,
                'tgl' => $row->tgl,
                'created_at' => $row->created_at,
                'tipe_dana' => 'bop',
                'arah' => 'masuk',
                'nominal' => $row->nominal,
                'ket' => $row->ket,
                'bkt_nota' => $row->bkt_nota,
            ]);

        // 2️⃣ BOP Keluar
        $bopKeluar = Pengeluaran::whereNotNull('masuk_bop_id')
            ->when($selectedDate, fn($query) => $query->whereDate('tgl', $selectedDate))
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(fn($row) => [
                'id' => 'bop-out-'.$row->id,
                'real_id' => $row->id,
                'tgl' => $row->tgl,
                'created_at' => $row->created_at,
                'tipe_dana' => 'bop',
                'arah' => 'keluar',
                'nominal' => $row->nominal,
                'ket' => $row->ket,
            ]);

        // 3️⃣ Iuran Masuk
        $iuranMasuk = PemasukanIuran::query()
            ->where('kat_iuran_id', '!=', 1)
            ->when($selectedDate, fn($query) => $query->whereDate('tgl', $selectedDate))
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(fn($row) => [
                'id' => 'iuran-in-'.$row->id,
                'real_id' => $row->id,
                'tgl' => $row->tgl,
                'created_at' => $row->created_at,
                'tipe_dana' => 'iuran',
                'arah' => 'masuk',
                'nominal' => $row->nominal,
                'ket' => $row->ket,
                'bkt_nota' => null,
            ]);

        // 4️⃣ Iuran Keluar
        $iuranKeluar = Pengeluaran::whereNotNull('masuk_iuran_id')
            ->when($selectedDate, fn($query) => $query->whereDate('tgl', $selectedDate))
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(fn($row) => [
                'id' => 'iuran-out-'.$row->id,
                'real_id' => $row->id,
                'tgl' => $row->tgl,
                'created_at' => $row->created_at,
                'tipe_dana' => 'iuran',
                'arah' => 'keluar',
                'nominal' => $row->nominal,
                'ket' => $row->ket,
            ]);

        // 5️⃣ GABUNG DAN URUTKAN SEMUA TRANSAKSI
        $timeline = $bopMasuk
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            ->sortBy(fn($item) => $item['tgl'].'-'.$item['created_at'])
            ->values()
            ->all();

        // --- 2. HITUNG SALDO BERJALAN (RUNNING BALANCE) ---
        
        $saldoBop = 0;
        $saldoIuran = 0;
        
        // 6️⃣ HITUNG SALDO AWAL (Saldo sebelum tanggal yang dipilih)
        if ($selectedDate) {
            $saldoBop = PemasukanBOP::whereDate('tgl', '<', $selectedDate)->sum('nominal')
                - Pengeluaran::whereNotNull('masuk_bop_id')->whereDate('tgl', '<', $selectedDate)->sum('nominal');

            $saldoIuran = PemasukanIuran::whereDate('tgl', '<', $selectedDate)->sum('nominal')
                - Pengeluaran::whereNotNull('masuk_iuran_id')->whereDate('tgl', '<', $selectedDate)->sum('nominal');
        } 
        // Jika tidak ada selectedDate, saldo awal sudah diset 0, yang berarti perhitungan dimulai dari awal data.

        $final = [];

        foreach ($timeline as $row) {
            $isBop = $row['tipe_dana'] === 'bop';
            $jumlah_awal = $isBop ? $saldoBop : $saldoIuran;

            if ($row['arah'] === 'masuk') {
                $jumlah_digunakan = 0;
                $jumlah_sisa = $jumlah_awal + $row['nominal'];
                $status = 'Pemasukan';
            } else {
                $jumlah_digunakan = $row['nominal'];
                $jumlah_sisa = $jumlah_awal - $row['nominal'];
                $status = 'Pengeluaran';
            }

            // Update saldo berjalan
            if ($isBop) {
                $saldoBop = $jumlah_sisa;
            } else {
                $saldoIuran = $jumlah_sisa;
            }

            $final[] = [
                'id' => $row['id'],
                'real_id' => $row['real_id'],
                'tgl' => $row['tgl'],
                'kategori' => $isBop ? 'BOP' : 'Iuran',
                'jumlah_awal' => $jumlah_awal,
                'jumlah_digunakan' => $jumlah_digunakan,
                'jumlah_sisa' => $jumlah_sisa,
                'status' => $status,
                'ket' => $row['ket'],
            ];
        }

        // Urutkan dari yang terbaru untuk tampilan tabel (kebalikan dari sorting timeline)
        $final = collect($final)->sortByDesc('tgl')->values()->all();

        return response()->json([
            'transaksi' => $final,
            // Sisa saldo terakhir di hari yang dipilih (jika ada) atau saldo akhir keseluruhan
            'saldoBopAkhir' => $saldoBop, 
            'saldoIuranAkhir' => $saldoIuran,
        ]);
    }
    
    /**
     * Lihat rincian detail (Id)
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRincian($id)
    {
        // Rincian BOP Masuk
        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->get()
            ->map(fn($row) => [
                'id' => 'bop-in-'.$row->id,
                'tgl' => $row->tgl, 'created_at' => $row->created_at, 'tipe_dana' => 'bop', 
                'arah' => 'masuk', 'nominal' => $row->nominal, 'ket' => $row->ket, 
                'bkt_nota' => $row->bkt_nota
            ]);

        // Rincian BOP Keluar
        $bopKeluar = Pengeluaran::whereNotNull('masuk_bop_id')
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at', 'toko', 'penerima')
            ->get()
            ->map(fn($row) => [
                'id' => 'bop-out-'.$row->id, 
                'tgl' => $row->tgl, 'created_at' => $row->created_at, 'tipe_dana' => 'bop', 
                'arah' => 'keluar', 'nominal' => $row->nominal, 'ket' => $row->ket, 
                'bkt_nota' => $row->bkt_nota, 'toko' => $row->toko, 'penerima' => $row->penerima,
            ]);

        // Rincian Iuran Masuk 
        $iuranMasuk = PemasukanIuran::select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(fn($row) => [
                'id' => 'iuran-in-'.$row->id, 
                'tgl' => $row->tgl, 'created_at' => $row->created_at, 'tipe_dana' => 'iuran', 
                'arah' => 'masuk', 'nominal' => $row->nominal, 'ket' => $row->ket, 'bkt_nota' => null,
            ]);

        // Rincian Iuran Keluar
        $iuranKeluar = Pengeluaran::whereNotNull('masuk_iuran_id')
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at', 'toko', 'penerima')
            ->get()
            ->map(fn($row) => [
                'id' => 'iuran-out-'.$row->id, 
                'tgl' => $row->tgl, 'created_at' => $row->created_at, 'tipe_dana' => 'iuran', 
                'arah' => 'keluar', 'nominal' => $row->nominal, 'ket' => $row->ket, 
                'bkt_nota' => $row->bkt_nota, 'toko' => $row->toko, 'penerima' => $row->penerima,
            ]);

        // Gabungkan semua
        $timeline = collect()
            ->concat($bopMasuk)
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            ->sortBy(fn($item) => $item['tgl'].'-'.$item['created_at'])
            ->values();

        $saldoBop = 0;
        $saldoIuran = 0;
        $rincian = null;

        // Loop untuk mendapatkan saldo berjalan dan rincian yang dicari
        foreach ($timeline as $row) {
            $isBop = $row['tipe_dana'] === 'bop';
            $jumlah_awal = $isBop ? $saldoBop : $saldoIuran;

            if ($row['arah'] === 'masuk') {
                $jumlah_digunakan = 0;
                $jumlah_sisa = $jumlah_awal + $row['nominal'];
                $status = 'Pemasukan';
            } else {
                $jumlah_digunakan = $row['nominal'];
                $jumlah_sisa = $jumlah_awal - $row['nominal'];
                $status = 'Pengeluaran';
            }

            // Update saldo berjalan
            if ($isBop) {
                $saldoBop = $jumlah_sisa;
            } else {
                $saldoIuran = $jumlah_sisa;
            }

            if ($row['id'] === $id) {
                $rincian = array_merge($row, [
                    'kategori' => $isBop ? 'BOP' : 'Iuran',
                    'jumlah_awal' => $jumlah_awal,
                    'jumlah_digunakan' => $jumlah_digunakan,
                    'jumlah_sisa' => $jumlah_sisa,
                    'status' => $status,
                ]);
                break; // Hentikan loop setelah rincian ditemukan
            }
        }
        
        if (!$rincian) {
            return response()->json(['message' => 'Data rincian tidak ditemukan'], 404);
        }

        // Tambahkan formatting dan link storage (sesuai logika di controller lama)
        $rincian['created_at'] = $rincian['created_at'] 
            ? Carbon::parse($rincian['created_at'])->format('Y-m-d H:i:s')
            : null;
        
        $rincian['bkt_nota_url'] = !empty($rincian['bkt_nota']) 
            ? url('storage/' . ltrim($rincian['bkt_nota'], '/')) 
            : null;
            
        $rincian['toko'] = $rincian['toko'] ?? '-';
        $rincian['penerima'] = $rincian['penerima'] ?? '-';

        return response()->json($rincian);
    }
}
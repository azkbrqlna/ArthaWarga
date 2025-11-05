<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use Inertia\Inertia;
use App\Models\Pengeluaran;
use App\Models\PemasukanIuran;
use App\Models\User;

class DashboardController extends Controller
{
    
    public function index()
    {
        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
    ->get()
    ->map(function ($row) {
        return [
            'id' => 'bop-in-'.$row->id,
            'real_id' => $row->id,
            'tgl' => $row->tgl,
            'created_at' => $row->created_at,
            'tipe_dana' => 'bop',
            'arah' => 'masuk',
            'nominal' => $row->nominal,
            'ket' => $row->ket,
           'bkt_nota' => $row->bkt_nota,

        ];
    });


        $bopKeluar = Pengeluaran::where('tipe', 'bop')
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(function ($row) {
                return [
                    'id' => 'bop-out-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'bop',
                    'arah' => 'keluar',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                ];
            });

        // 2) ambil semua pemasukan & pengeluaran IURAN
        $iuranMasuk = PemasukanIuran::where('status', 'approved')
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(function ($row) {
                return [
                    'id' => 'iuran-in-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'iuran',
                    'arah' => 'masuk',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                ];
            });

        $iuranKeluar = Pengeluaran::where('tipe', 'iuran')
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at')
            ->get()
            ->map(function ($row) {
                return [
                    'id' => 'iuran-out-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'iuran',
                    'arah' => 'keluar',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                ];
            });

        // gabung
        
        $timeline = $bopMasuk
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            // urutkan kronologis: tanggal dulu, baru created_at
            ->sortBy(function ($item) {
                return $item['tgl'].'-'.$item['created_at'];
            })
            ->values()
            ->all();

        $saldoBop = 0;
        $saldoIuran = 0;
        $final = [];

        foreach ($timeline as $row) {
            if ($row['tipe_dana'] === 'bop') {
                $jumlah_awal = $saldoBop;

                if ($row['arah'] === 'masuk') {
                    $jumlah_digunakan = 0;
                    $jumlah_sisa = $jumlah_awal + $row['nominal'];
                    $saldoBop = $jumlah_sisa;
                    $status = 'Pemasukan';
                } else {
                    $jumlah_digunakan = $row['nominal'];
                    $jumlah_sisa = $jumlah_awal - $row['nominal'];
                    $saldoBop = $jumlah_sisa;
                    $status = 'Pengeluaran';
                }

                $final[] = [
                    'id' => $row['id'],
                    'real_id' => $row['real_id'],
                    'tgl' => $row['tgl'],
                    'kategori' => 'BOP',
                    'jumlah_awal' => $jumlah_awal,
                    'jumlah_digunakan' => $jumlah_digunakan,
                    'jumlah_sisa' => $jumlah_sisa,
                    'status' => $status,
                    'ket' => $row['ket'],
                ];
            } else {
                // iuran
                $jumlah_awal = $saldoIuran;

                if ($row['arah'] === 'masuk') {
                    $jumlah_digunakan = 0;
                    $jumlah_sisa = $jumlah_awal + $row['nominal'];
                    $saldoIuran = $jumlah_sisa;
                    $status = 'Pemasukan';
                } else {
                    $jumlah_digunakan = $row['nominal'];
                    $jumlah_sisa = $jumlah_awal - $row['nominal'];
                    $saldoIuran = $jumlah_sisa;
                    $status = 'Pengeluaran';
                }

                $final[] = [
                    'id' => $row['id'],
                    'real_id' => $row['real_id'],
                    'tgl' => $row['tgl'],
                    'kategori' => 'Iuran',
                    'jumlah_awal' => $jumlah_awal,
                    'jumlah_digunakan' => $jumlah_digunakan,
                    'jumlah_sisa' => $jumlah_sisa,
                    'status' => $status,
                    'ket' => $row['ket'],
                ];
            }
        }

        $final = collect($final)->sortByDesc('tgl')->values();

       $totalBop = PemasukanBOP::sum('nominal');
$totalIuran = PemasukanIuran::where('status', 'approved')->sum('nominal');
$totalPengeluaran = Pengeluaran::sum('nominal');

// 💡 hitung saldo awal & sisa saldo
$saldoAwal = $totalBop + $totalIuran;
$sisaSaldo = $saldoAwal - $totalPengeluaran;

$userTotal = User::count();

return Inertia::render('Dashboard', [
    'transaksi' => $final,
    'saldoAwal' => $saldoAwal,
    'sisaSaldo' => $sisaSaldo,
    'totalPengeluaran' => $totalPengeluaran,
    'userTotal' => $userTotal,
]);

    }



public function rincian($id)
{
    // 🧩 pecah id gabungan, contoh: "bop-in-2"
    [$tipe, $arah, $realId] = explode('-', $id);

    // 🔹 ambil semua transaksi untuk perhitungan saldo
    $bopMasuk = \App\Models\PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
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

    $bopKeluar = \App\Models\Pengeluaran::where('tipe', 'bop')
        ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
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
            'bkt_nota' => $row->bkt_nota,
        ]);

    $iuranMasuk = \App\Models\PemasukanIuran::where('status', 'approved')
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

    $iuranKeluar = \App\Models\Pengeluaran::where('tipe', 'iuran')
        ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
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
            'bkt_nota' => $row->bkt_nota,
        ]);

    // 🔹 gabungkan & urutkan berdasarkan tanggal
    $timeline = collect()
        ->concat($bopMasuk)
        ->concat($bopKeluar)
        ->concat($iuranMasuk)
        ->concat($iuranKeluar)
        ->sortBy(fn($item) => $item['tgl'].'-'.$item['created_at'])
        ->values();

    // 🔹 hitung saldo berjalan
    $saldoBop = 0;
    $saldoIuran = 0;
    $final = [];

    foreach ($timeline as $row) {
        if ($row['tipe_dana'] === 'bop') {
            $jumlah_awal = $saldoBop;

            if ($row['arah'] === 'masuk') {
                $jumlah_digunakan = 0;
                $jumlah_sisa = $jumlah_awal + $row['nominal'];
                $saldoBop = $jumlah_sisa;
                $status = 'Pemasukan';
            } else {
                $jumlah_digunakan = $row['nominal'];
                $jumlah_sisa = $jumlah_awal - $row['nominal'];
                $saldoBop = $jumlah_sisa;
                $status = 'Pengeluaran';
            }

            $final[] = [
                'id' => $row['id'],
                'real_id' => $row['real_id'],
                'tgl' => $row['tgl'],
                'created_at' => $row['created_at'],
                'kategori' => 'BOP',
                'jumlah_awal' => $jumlah_awal,
                'jumlah_digunakan' => $jumlah_digunakan,
                'jumlah_sisa' => $jumlah_sisa,
                'status' => $status,
                'ket' => $row['ket'],
                'bkt_nota' => $row['bkt_nota']
                    ? url('storage/' . ltrim($row['bkt_nota'], '/'))
                    : null,
            ];
        } else {
            $jumlah_awal = $saldoIuran;

            if ($row['arah'] === 'masuk') {
                $jumlah_digunakan = 0;
                $jumlah_sisa = $jumlah_awal + $row['nominal'];
                $saldoIuran = $jumlah_sisa;
                $status = 'Pemasukan';
            } else {
                $jumlah_digunakan = $row['nominal'];
                $jumlah_sisa = $jumlah_awal - $row['nominal'];
                $saldoIuran = $jumlah_sisa;
                $status = 'Pengeluaran';
            }

            $final[] = [
                'id' => $row['id'],
                'real_id' => $row['real_id'],
                'tgl' => $row['tgl'],
                'created_at' => $row['created_at'],
                'kategori' => 'Iuran',
                'jumlah_awal' => $jumlah_awal,
                'jumlah_digunakan' => $jumlah_digunakan,
                'jumlah_sisa' => $jumlah_sisa,
                'status' => $status,
                'ket' => $row['ket'],
                'bkt_nota' => !empty($row['bkt_nota'])
                    ? url('storage/' . ltrim($row['bkt_nota'], '/'))
                    : null,
            ];
        }
    }

    // 🔹 ambil transaksi sesuai id gabungan (bukan real_id)
    $rincian = collect($final)->firstWhere('id', $id);

    if (!$rincian) {
        abort(404, 'Data tidak ditemukan');
    }

    // format waktu created_at
    $rincian['created_at'] = $rincian['created_at']
        ? \Carbon\Carbon::parse($rincian['created_at'])->format('Y-m-d H:i:s')
        : null;

    return Inertia::render('Ringkasan/Rincian', [
        'rincian' => $rincian,
    ]);
}




}
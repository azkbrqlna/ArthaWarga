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
        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'created_at')
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
        $userTotal = User::count();
        $totalPengeluaran = Pengeluaran::sum('nominal');


        return Inertia::render('Dashboard', [
            'transaksi' => $final,
            'totalBop' => $totalBop,
            'totalIuran' => $totalIuran,
            'totalPengeluaran' => $totalPengeluaran,
            'userTotal' => $userTotal,
        ]);
    }



public function rincian($id)
{
    $bop = PemasukanBOP::find($id);
    $iuran = PemasukanIuran::find($id);
    $pengeluaran = Pengeluaran::find($id);

    $data = $bop ?? $iuran ?? $pengeluaran;

    if (!$data) {
        abort(404);
    }

    return Inertia::render('Ringkasan/Rincian', [
        'transaksi' => [
            'id' => $data->id,
            'tgl' => $data->tgl,
            'nominal' => $data->nominal,
            'ket' => $data->ket,
            'tipe' => $data->tipe ?? ($bop ? 'bop' : 'iuran'),
        ],
    ]);
}



}
<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use App\Models\Pengeluaran;
use App\Models\PemasukanIuran;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 🟢 Tambahan filter tanggal
        $selectedDate = $request->input('date');

        // 🔹 ambil data BOP masuk
        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->when($selectedDate, function ($query, $selectedDate) {
                return $query->whereDate('tgl', $selectedDate);
            })
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

        // 🔹 ambil data BOP keluar
        $bopKeluar = Pengeluaran::where('tipe', 'bop')
            ->when($selectedDate, function ($query, $selectedDate) {
                return $query->whereDate('tgl', $selectedDate);
            })
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

        // 🔹 ambil data IURAN masuk
        $iuranMasuk = PemasukanIuran::where('status', 'approved')
            ->when($selectedDate, function ($query, $selectedDate) {
                return $query->whereDate('tgl', $selectedDate);
            })
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

        // 🔹 ambil data IURAN keluar
        $iuranKeluar = Pengeluaran::where('tipe', 'iuran')
            ->when($selectedDate, function ($query, $selectedDate) {
                return $query->whereDate('tgl', $selectedDate);
            })
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

        // 🔹 gabung semua transaksi
        $timeline = $bopMasuk
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            ->sortBy(fn($item) => $item['tgl'].'-'.$item['created_at'])
            ->values()
            ->all();

if ($selectedDate) {
    // saldo sebelum tanggal yang dipilih
    $saldoBop = PemasukanBOP::whereDate('tgl', '<', $selectedDate)->sum('nominal')
        - Pengeluaran::where('tipe', 'bop')->whereDate('tgl', '<', $selectedDate)->sum('nominal');

    $saldoIuran = PemasukanIuran::where('status', 'approved')
        ->whereDate('tgl', '<', $selectedDate)->sum('nominal')
        - Pengeluaran::where('tipe', 'iuran')->whereDate('tgl', '<', $selectedDate)->sum('nominal');
} else {
    $saldoBop = 0;
    $saldoIuran = 0;
}

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

        // 🔹 ringkasan saldo
        $totalBop = PemasukanBOP::sum('nominal');
        $totalIuran = PemasukanIuran::where('status', 'approved')->sum('nominal');
        $totalPengeluaran = Pengeluaran::sum('nominal');

        $saldoAwal = $totalBop + $totalIuran;
        $sisaSaldo = $saldoAwal - $totalPengeluaran;
        $userTotal = User::count();
        $totalPengeluaranBop = Pengeluaran::where('tipe', 'bop')->sum('nominal');
        $totalPengeluaranIuran = Pengeluaran::where('tipe', 'iuran')->sum('nominal');

        // 🔹 Hitung saldo masing-masing
        $sisaBop = $totalBop - $totalPengeluaranBop;
        $sisaIuran = $totalIuran - $totalPengeluaranIuran;

        return Inertia::render('Dashboard', [
            'transaksi' => $final,
            'saldoAwal' => $saldoAwal,
            'sisaSaldo' => $sisaSaldo,
            'totalPengeluaran' => $totalPengeluaran,
            'userTotal' => $userTotal,
            'selectedDate' => $selectedDate,
            'sisaBop' => $sisaBop,
            'sisaIuran' => $sisaIuran
        ]);
    }

    // 🟣 fungsi rincian tetap sama
    public function rincian($id)
    {
        [$tipe, $arah, $realId] = explode('-', $id);

        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
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

        $bopKeluar = Pengeluaran::where('tipe', 'bop')
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

        $iuranMasuk = PemasukanIuran::where('status', 'approved')
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

        $iuranKeluar = Pengeluaran::where('tipe', 'iuran')
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

        $timeline = collect()
            ->concat($bopMasuk)
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            ->sortBy(fn($item) => $item['tgl'].'-'.$item['created_at'])
            ->values();

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

        $rincian = collect($final)->firstWhere('id', $id);

        if (!$rincian) {
            abort(404, 'Data tidak ditemukan');
        }

        $rincian['created_at'] = $rincian['created_at']
            ? \Carbon\Carbon::parse($rincian['created_at'])->format('Y-m-d H:i:s')
            : null;

        return Inertia::render('Ringkasan/Rincian', [
            'rincian' => $rincian,
        ]);
    }
}

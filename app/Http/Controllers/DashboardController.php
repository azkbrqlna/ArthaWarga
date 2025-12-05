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

        // acuan bulan berjalan (sekarang)
        $now = now();
        $curYear = $now->year;
        $curMonth = $now->month;

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
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at', 'toko')
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
                    'toko' => $row->toko,
                ];
            });

        // 🔹 ambil data IURAN masuk (approved)
        // IMPORTANT: hanya ambil pemasukan iuran yang pengumuman.created_at < bulan berjalan
        $iuranMasuk = PemasukanIuran::where('masuk_iuran.status', 'approved')
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->when($selectedDate, function ($query, $selectedDate) {
                return $query->whereDate('masuk_iuran.tgl', $selectedDate);
            })
            ->where(function ($q) use ($curYear, $curMonth) {
                $q->whereYear('pengumuman.created_at', '<', $curYear)
                  ->orWhere(function ($q2) use ($curYear, $curMonth) {
                      $q2->whereYear('pengumuman.created_at', $curYear)
                         ->whereMonth('pengumuman.created_at', '<', $curMonth);
                  });
            })
            ->select('masuk_iuran.id', 'masuk_iuran.tgl', 'masuk_iuran.nominal', 'masuk_iuran.ket', 'masuk_iuran.created_at')
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
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at', 'toko')
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
                    'toko' => $row->toko,
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

        // totalIuran: hanya approved yang pengumuman dibuat sebelum bulan berjalan
        $totalIuran = PemasukanIuran::where('masuk_iuran.status', 'approved')
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->where(function ($q) use ($curYear, $curMonth) {
                $q->whereYear('pengumuman.created_at', '<', $curYear)
                  ->orWhere(function ($q2) use ($curYear, $curMonth) {
                      $q2->whereYear('pengumuman.created_at', $curYear)
                         ->whereMonth('pengumuman.created_at', '<', $curMonth);
                  });
            })
            ->sum('masuk_iuran.nominal');
            $jumlahApproved = PemasukanIuran::where('masuk_iuran.status', 'approved')
                ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
                ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
                ->sum('pengumuman.jumlah');

            $totalIuranManual = PemasukanIuran::where('status', 'approved')
                ->whereNull('pengumuman_id')
                ->sum('nominal');

        $totalPengeluaran = Pengeluaran::sum('nominal');
            $totalIuran = $totalIuranManual + $jumlahApproved;

            $totalPengeluaran = Pengeluaran::sum('nominal');
            $totalPengeluaranBop = Pengeluaran::where('tipe', 'bop')->sum('nominal');
            $totalPengeluaranIuran = Pengeluaran::where('tipe', 'iuran')->sum('nominal');

        $saldoAwal = $totalBop + $totalIuran;
        $sisaSaldo = $saldoAwal - $totalPengeluaran;
        $userTotal = User::count();
        $totalPengeluaranBop = Pengeluaran::where('tipe', 'bop')->sum('nominal');
        $totalPengeluaranIuran = Pengeluaran::where('tipe', 'iuran')->sum('nominal');
            $saldoAwal = $totalBop + $totalIuran;
            $sisaSaldo = $saldoAwal - $totalPengeluaran;

        // 🔹 Hitung saldo masing-masing
        $sisaBop = $totalBop - $totalPengeluaranBop;
        $sisaIuran = $totalIuran - $totalPengeluaranIuran;
            $sisaBop = $totalBop - $totalPengeluaranBop;
            $sisaIuran = $totalIuran - $totalPengeluaranIuran;

            $userTotal = User::count();


            

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
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at', 'toko')
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
                'toko' => $row->toko,
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
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at', 'toko')
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
                'toko' => $row->toko,
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
                    'bkt_nota' => $row['bkt_nota'] ? url('storage/' . ltrim($row['bkt_nota'], '/')) : null,
                    'bkt_nota' => $row['bkt_nota'] 
                        ? url('storage/' . ltrim($row['bkt_nota'], '/'))
                        : null,
                    'toko' => $row['toko'] ?? '-',
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
                    'bkt_nota' => !empty($row['bkt_nota']) ? url('storage/' . ltrim($row['bkt_nota'], '/')) : null,
                    'bkt_nota' => !empty($row['bkt_nota'])
                        ? url('storage/' . ltrim($row['bkt_nota'], '/'))
                        : null,
                    'toko' => $row['toko'] ?? '-',
                ];
            }
        }

        
        // Ambil detail spesifik dari hasil looping
        $rincian = collect($final)->firstWhere('id', $id);

        if (!$rincian) {
            abort(404, 'Data tidak ditemukan');
        }

        $rincian['created_at'] = $rincian['created_at']
            ? \Carbon\Carbon::parse($rincian['created_at'])->format('Y-m-d H:i:s')
            : null;
        
        if (!isset($rincian['toko'])) {
            $rincian['toko'] = '-';
        }

        $pemasukanBop = 0;
        $pemasukanIuran = 0;

        // Cek prefix ID untuk menentukan query mana yang dijalankan
        if (str_contains($id, 'bop-in-')) {
            // Jika ini transaksi BOP Masuk
            $realId = str_replace('bop-in-', '', $id);
            $pemasukanBop = PemasukanBOP::where('id', $realId)->value('nominal');
            
        } elseif (str_contains($id, 'iuran-in-')) {
            // Jika ini transaksi Iuran Masuk
            $realId = str_replace('iuran-in-', '', $id);
            $pemasukanIuran = PemasukanIuran::where('id', $realId)
                ->where('status', 'approved')
                ->value('nominal');
        }

        // dd($pemasukanBop); 
        // dd($pemasukanIuran);

        return Inertia::render('Ringkasan/Rincian', [
            'rincian' => $rincian,
            'pemasukanBOP' => $pemasukanBop,
            'pemasukanIuran' => $pemasukanIuran,
        ]);
    }
}
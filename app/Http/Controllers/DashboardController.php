<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use App\Models\Pengeluaran;
use App\Models\PemasukanIuran;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 🟢 Tambahan filter tanggal dari inputan user
        $selectedDate = $request->input('date');

        // 1️⃣ AMBIL DATA BOP MASUK
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

        // 2️⃣ AMBIL DATA BOP KELUAR (Gunakan whereNotNull masuk_bop_id)
        $bopKeluar = Pengeluaran::whereNotNull('masuk_bop_id')
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

        // 3️⃣ AMBIL DATA IURAN MASUK (Tanpa Status Approved)
        $iuranMasuk = PemasukanIuran::query()
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
                    'bkt_nota' => null,
                ];
            });

        // 4️⃣ AMBIL DATA IURAN KELUAR (Gunakan whereNotNull masuk_iuran_id)
        $iuranKeluar = Pengeluaran::whereNotNull('masuk_iuran_id')
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

        // 5️⃣ GABUNG SEMUA TRANSAKSI (TIMELINE)
        $timeline = $bopMasuk
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            ->sortBy(fn($item) => $item['tgl'].'-'.$item['created_at'])
            ->values()
            ->all();

        // 6️⃣ HITUNG SALDO AWAL (Running Balance logic)
        if ($selectedDate) {
            // saldo sebelum tanggal yang dipilih
            $saldoBop = PemasukanBOP::whereDate('tgl', '<', $selectedDate)->sum('nominal')
                - Pengeluaran::whereNotNull('masuk_bop_id')->whereDate('tgl', '<', $selectedDate)->sum('nominal');

            $saldoIuran = PemasukanIuran::whereDate('tgl', '<', $selectedDate)->sum('nominal')
                - Pengeluaran::whereNotNull('masuk_iuran_id')->whereDate('tgl', '<', $selectedDate)->sum('nominal');
        } else {
            $saldoBop = 0;
            $saldoIuran = 0;
        }

        $final = [];

        // Loop untuk menghitung saldo berjalan (Running Balance) di tabel
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
            } else { // Iuran
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

        // Urutkan dari yang terbaru untuk tampilan tabel
        $final = collect($final)->sortByDesc('tgl')->values();

        // 7️⃣ RINGKASAN SALDO UNTUK KARTU ATAS (CARD)
        $totalBop = PemasukanBOP::sum('nominal');

        // 🔥 Iuran tanpa status approved
        $totalIuran = PemasukanIuran::sum('nominal');

        $totalPengeluaran = Pengeluaran::sum('nominal');
        
        // Ganti where('tipe') dengan whereNotNull('fk_id')
        $totalPengeluaranBop = Pengeluaran::whereNotNull('masuk_bop_id')->sum('nominal');
        $totalPengeluaranIuran = Pengeluaran::whereNotNull('masuk_iuran_id')->sum('nominal');

        $saldoAwal = $totalBop + $totalIuran;
        $sisaSaldo = $saldoAwal - $totalPengeluaran;
        $userTotal = User::count();

        // 🔹 Hitung sisa saldo masing-masing kategori
        $sisaBop = $totalBop - $totalPengeluaranBop;
        $sisaIuran = $totalIuran - $totalPengeluaranIuran;

        return Inertia::render('Dashboard', [
            'transaksi' => $final,
            'saldoAwal' => $saldoAwal, // Total Pemasukan
            'sisaSaldo' => $sisaSaldo, // Saldo Sekarang (Sisa)
            'totalPengeluaran' => $totalPengeluaran,
            'userTotal' => $userTotal,
            'selectedDate' => $selectedDate,
            'sisaBop' => $sisaBop,
            'sisaIuran' => $sisaIuran
        ]);
    }

    // 🟣 fungsi rincian
    public function rincian($id)
    {
        // Rincian BOP Masuk
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

        // Rincian BOP Keluar
        $bopKeluar = Pengeluaran::whereNotNull('masuk_bop_id')
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

        // Rincian Iuran Masuk (Tanpa Status)
        $iuranMasuk = PemasukanIuran::select('id', 'tgl', 'nominal', 'ket', 'created_at')
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

        // Rincian Iuran Keluar
        $iuranKeluar = Pengeluaran::whereNotNull('masuk_iuran_id')
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
            $realId = str_replace('bop-in-', '', $id);
            $pemasukanBop = PemasukanBOP::where('id', $realId)->value('nominal');
            
        } elseif (str_contains($id, 'iuran-in-')) {
            $realId = str_replace('iuran-in-', '', $id);
            // Hapus filter status approved
            $pemasukanIuran = PemasukanIuran::where('id', $realId)
                ->value('nominal');
        }

        return Inertia::render('Ringkasan/Rincian', [
            'rincian' => $rincian,
            'pemasukanBOP' => $pemasukanBop,
            'pemasukanIuran' => $pemasukanIuran,
        ]);
    }
}
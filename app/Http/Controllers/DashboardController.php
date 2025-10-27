<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Pengeluran;

class DashboardController extends Controller
{
    public function index()
    {
       // Hitung total KK (user)
       $totalKK = User::count();

       // Total dana BOP dan Iuran
       $totalBOP =PemasukanBOP::sum('jumlah');
       $totalIuran =PemasukanIuran::sum('jumlah');
        
        // Total pengeluaran
        $totalPengeluaran = Pengeluaran::sum('jumlah');

        // Saldo akhir
        $saldoBOP = $totalBOP - $totalPengeluaran;
        $saldoIuran = $totalIuran - $totalPengeluaran;
        $totalKeseluruhan = $saldoBOP + $saldoIuran;

        // Ambil transaksi terakhir diedit (misalnya dari tabel pengeluaran/iuran)
        $transaksiTerakhir = Pengeluaran::select('created_at', 'kategori', 'jumlah', 'status', 'diedit_oleh')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

      return Inertia::render('Dashboard', [
            'totalKK' => $totalKK,
            'totalBOP' => $saldoBOP,
            'totalIuran' => $saldoIuran,
            'totalKeseluruhan' => $totalKeseluruhan,
            'transaksiTerakhir' => $transaksiTerakhir,
        ]);
    }
}
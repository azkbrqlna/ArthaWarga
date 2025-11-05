<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $saldoBop = PemasukanBOP::sum('nominal');
        $saldoIuran = PemasukanIuran::where('status', 'approved')->sum('nominal');

        $totalKK = User::count();

        dd($totalKK);

        return Inertia::render('Dashboard',[
            'saldoBop' => $saldoBop,
            'saldoIuran' => $saldoIuran,
            'totalKK' => $totalKK
        ]);
    } 

}

<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $saldoBop = PemasukanBOP::sum('nominal');
        $saldoIuran = PemasukanIuran::where('status', 'approved')->sum('nominal');

        $totalKK = User::count();


        return Inertia::render('Dashboard',[
            'saldoBop' => $saldoBop,
            'saldoIuran' => $saldoIuran,
            'totalKK' => $totalKK
        ]);
    } 

}

<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanBOP;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard');
    }

    public function bop()
    {
        return Inertia::render('Ringkasan/Pemasukan_BOP');
    }

    public function iuran()
    {
        $kategori_iuran = KategoriIuran::all();

        return Inertia::render('Ringkasan/Pemasukan_Iuran',[
            'kategori_iuran' => $kategori_iuran
        ]);
    }

}

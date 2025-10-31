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

   public function pemasukan()
    {
        $kategori_iuran = KategoriIuran::whereNotIn('id', [1, 2])->get();

        return Inertia::render('Ringkasan/Pemasukan', [
            'kategori_iuran' => $kategori_iuran
        ]);
    }

    public function pengumuman()
    {
        $kategori_iuran = KategoriIuran::whereIn('id', [1, 2])->get();

        return Inertia::render('Ringkasan/Pengumuman', [
            'kategori_iuran' => $kategori_iuran
        ]);

    }

}

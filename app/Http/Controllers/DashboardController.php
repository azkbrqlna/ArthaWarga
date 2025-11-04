<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanBOP;
use App\Models\Pengumuman;
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

    /**
     * Simpan data pengumuman baru
     */
    public function pengumuman_create(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'ket' => 'required|string',
            'kat_iuran_id' => 'required|integer|exists:kat_iuran,id',
        ]);

        Pengumuman::create($validated);

        return redirect()->back()->with('success', 'Pengumuman berhasil dibuat!');
    }
}

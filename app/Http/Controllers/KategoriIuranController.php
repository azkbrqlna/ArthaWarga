<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanIuran; 
use App\Models\HargaIuran; 
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia; 

class KategoriIuranController extends Controller
{
    /**
     * GET /kategori-setting
     * Menampilkan halaman management kategori (List Data)
     */
    public function index()
    {
        // Mengambil data kategori urut abjad
        $kategoriList = KategoriIuran::orderBy('nm_kat', 'asc')->whereNot('id', 1)->get();

        // Render halaman React yang baru kita buat tadi
        return Inertia::render('TagihanBulanan/KategoriIndex', [
            'kategoriList' => $kategoriList
        ]);
    }

    /**
     * POST /kategori-setting
     * Menyimpan kategori baru & membuat slot harga default
     */
    /**
     * POST /kat_iuran: Menyimpan NAMA kategori iuran baru dan membuat entri harga default.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nm_kat' => 'required|string|max:100|unique:kat_iuran,nm_kat', 
        ]);

        $kategori = KategoriIuran::create($validated);
        
        HargaIuran::create([
            'kat_iuran_id' => $kategori->id,
        ]);

        return redirect()->back() 
                         ->with('success', 'Kategori iuran berhasil ditambahkan dan konfigurasi harga default dibuat.');
    }


    public function destroy(KategoriIuran $kat_iuran)
    {
        if ($kat_iuran->pemasukanIuran()->exists()) {
             return redirect()->back()
                              ->with('error', 'Gagal menghapus! Kategori ini masih digunakan dalam data iuran.');
        }
        
        $kat_iuran->delete();
        
        return redirect()->back()
                         ->with('success', 'Kategori iuran berhasil dihapus.');
    }

}
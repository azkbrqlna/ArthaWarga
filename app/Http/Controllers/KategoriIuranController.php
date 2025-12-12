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
        $kategoriList = KategoriIuran::orderBy('nm_kat', 'asc')->get();

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
        // Tambahkan array kedua untuk pesan error custom
        $validated = $request->validate([
            'nm_kat' => 'required|string|max:100|unique:kat_iuran,nm_kat', 
        ], [
            // Custom pesan error di sini:
            'nm_kat.required' => 'Nama Kategori wajib diisi.',
            'nm_kat.unique'   => 'Nama Kategori ini sudah ada, gunakan nama lain.',
            'nm_kat.max'      => 'Nama Kategori maksimal 100 karakter.',
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
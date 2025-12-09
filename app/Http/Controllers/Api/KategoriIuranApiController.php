<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use App\Models\HargaIuran; 
use Illuminate\Validation\Rule;

class KategoriIuranApiController extends Controller
{
    /**
     * GET /api/kategori-iuran: Menampilkan daftar NAMA kategori (index).
     */
    public function index()
    {
        $kategori = KategoriIuran::select('id', 'nm_kat')->get(); 

        return response()->json([
            'success' => true,
            'data' => $kategori
        ]);
    }
    
    /**
     * POST /api/kategori-iuran: Menyimpan NAMA kategori baru dan membuat entri harga default (store).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nm_kat' => 'required|string|max:100|unique:kat_iuran,nm_kat', 
        ]);

        // 1. Buat entri master di tabel kat_iuran
        $kategori = KategoriIuran::create($validated);
        
        // 2. Buat entri konfigurasi harga default di tabel harga_iuran
        $harga_default = HargaIuran::create([
            'kat_iuran_id' => $kategori->id,
        ]);
        
        // Muat relasi harga untuk respons, agar data yang dikembalikan lengkap
        $kategori->load('hargaKonfigurasi');

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil ditambahkan dan konfigurasi harga default dibuat.',
            'data' => $kategori,
        ], 201); 
    }

    /**
     * GET /api/kategori-iuran/{id}: Menampilkan detail satu kategori iuran (show).
     */
    public function show(string $id)
    {
        $kategori = KategoriIuran::with('hargaKonfigurasi')->find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori iuran tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $kategori
        ]);
    }
    
    /**
     * DELETE /api/kategori-iuran/{id}: Menghapus kategori iuran (destroy).
     */
    public function destroy(string $id)
    {
        $kategori = KategoriIuran::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori iuran tidak ditemukan.'
            ], 404);
        }

        $dipakai = PemasukanIuran::where('kat_iuran_id', $id)->exists();

        if ($dipakai) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori digunakan dalam data iuran lain dan tidak dapat dihapus.'
            ], 400); 
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus.'
        ]);
    }
}
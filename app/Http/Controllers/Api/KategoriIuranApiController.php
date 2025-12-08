<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use Illuminate\Validation\Rule;

class KategoriIuranApiController extends Controller
{
    /**
     * GET /kategori-iuran: Menampilkan daftar semua kategori iuran (index).
     */
    public function index()
    {
        $kategori = KategoriIuran::all(); 

        return response()->json([
            'success' => true,
            'data' => $kategori
        ]);
    }
    
    /**
     * POST /kategori-iuran: Menyimpan (Create) kategori iuran baru (store).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nm_kat' => 'required|string|max:100|unique:kat_iuran,nm_kat',
            'harga_meteran' => 'nullable|integer|min:0', 
            'abonemen' => 'nullable|integer|min:0',      
            'harga_sampah' => 'nullable|integer|min:0',  
            'jimpitan_air' => 'nullable|integer|min:0|max:100', 
        ]);

        $kategori = KategoriIuran::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil ditambahkan.',
            'data' => $kategori,
        ], 201); 
    }

    /**
     * GET /kategori-iuran/{id}: Menampilkan detail satu kategori iuran (show).
     */
    public function show(string $id)
    {
        $kategori = KategoriIuran::find($id);

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
     * PUT/PATCH /kategori-iuran/{id}: Mengubah (Update) data kategori iuran.
     */
    public function update(Request $request, string $id)
    {
        $kategori = KategoriIuran::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori iuran tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'nm_kat' => ['required', 'string', 'max:100', Rule::unique('kat_iuran')->ignore($kategori->id)], 
            'harga_meteran' => 'nullable|integer|min:0',
            'abonemen' => 'nullable|integer|min:0',
            'harga_sampah' => 'nullable|integer|min:0',
            'jimpitan_air' => 'nullable|integer|min:0|max:100',
        ]);
        
        $kategori->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil diperbarui.',
            'data' => $kategori
        ]);
    }

    /**
     * DELETE /kategori-iuran/{id}: Menghapus (Delete) kategori iuran (destroy).
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
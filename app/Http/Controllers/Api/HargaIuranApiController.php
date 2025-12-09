<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriIuran; 
use App\Models\HargaIuran;   
use Illuminate\Http\Request;

class HargaIuranApiController extends Controller
{
    /**
     * GET /api/kategori-iuran/harga: Menampilkan daftar semua konfigurasi harga.
     */
    public function index()
    {
        $hargaKonfigurasi = HargaIuran::with('kategori')->get(); 

        return response()->json([
            'success' => true,
            'data' => $hargaKonfigurasi
        ]);
    }

    /**
     * PATCH /api/kategori-iuran/harga/{id}: Mengubah (Update) kolom harga/persentase di tabel harga_iuran.
     */
    public function update(Request $request, string $id)
    {
        $hargaIuran = HargaIuran::with('kategori')->findOrFail($id);
        
        $validated = $request->validate([
            'harga_meteran' => 'nullable|integer|min:0', 
            'abonemen' => 'nullable|integer|min:0',      
            'harga_sampah' => 'nullable|integer|min:0',  
            'jimpitan_air' => 'nullable|integer|min:0|max:100', 
        ]);
        
        $hargaIuran->update($validated);

        $kategori_nama = $hargaIuran->kategori->nm_kat;

        return response()->json([
            'success' => true,
            'message' => 'Konfigurasi harga kategori ' . $kategori_nama . ' berhasil diperbarui.',
            'data' => $hargaIuran
        ]);
    }
}
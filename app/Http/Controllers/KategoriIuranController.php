<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanIuran; 
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia; 

class KategoriIuranController extends Controller
{
    /**
     * GET /kat_iuran: Menampilkan daftar dan halaman manajemen master data.
     */
    public function index()
    {
        $kategori = KategoriIuran::all(); 

        return Inertia::render('Admin/MasterData/KategoriIuranIndex', [
            'kategoriIurans' => $kategori
        ]);
    }

    /**
     * POST /kat_iuran: Menyimpan (Create) kategori iuran baru.
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

        KategoriIuran::create($validated);

        return redirect()->route('kat_iuran.index')
                         ->with('success', 'Kategori iuran berhasil ditambahkan.');
    }

    /**
     * PUT/PATCH /kat_iuran/{id}: Mengubah (Update) data kategori iuran.
     */
    public function update(Request $request, KategoriIuran $kategoriIuran)
    {
        $validated = $request->validate([
            'nm_kat' => [
                'required', 
                'string', 
                'max:100', 
                Rule::unique('kat_iuran', 'nm_kat')->ignore($kategoriIuran->id)
            ], 
            'harga_meteran' => 'nullable|integer|min:0',
            'abonemen' => 'nullable|integer|min:0',
            'harga_sampah' => 'nullable|integer|min:0',
            'jimpitan_air' => 'nullable|integer|min:0|max:100',
        ]);
        
        $kategoriIuran->update($validated);

        return redirect()->route('kat_iuran.index')
                         ->with('success', 'Kategori iuran berhasil diperbarui.');
    }

    /**
     * DELETE /kat_iuran/{id}: Menghapus (Delete) kategori iuran.
     */
    public function destroy(KategoriIuran $kategoriIuran)
    {
        if ($kategoriIuran->pemasukanIuran()->exists()) {
             return redirect()->route('kat_iuran.index')
                              ->with('error', 'Gagal menghapus! Kategori ini masih digunakan dalam data iuran.');
        }
        
        $kategoriIuran->delete();
        
        return redirect()->route('kat_iuran.index')
                         ->with('success', 'Kategori iuran berhasil dihapus.');
    }

}
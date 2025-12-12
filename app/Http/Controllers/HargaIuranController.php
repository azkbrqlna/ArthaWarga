<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\HargaIuran; 
use Illuminate\Http\Request;
use Inertia\Inertia;

class HargaIuranController extends Controller
{

    public function index()
    {
        $kategori = HargaIuran::with('kategori')->get(); 

        return Inertia::render('TagihanBulanan/MasterIuranIndex', [
            'kategoriIurans' => $kategori
        ]);
    }


    public function update(Request $request, HargaIuran $harga_iuran) 
    {
        $validated = $request->validate([
            'harga_meteran' => 'nullable|integer|min:0', 
            'abonemen' => 'nullable|integer|min:0',      
            'harga_sampah' => 'nullable|integer|min:0',  
            'jimpitan_air' => 'nullable|integer|min:0', 
        ]);
        
        $harga_iuran->update($validated);
        
        $kategori_nama = $harga_iuran->kategori->nm_kat;

        return redirect()->route('kat_iuran.index')
                         ->with('success', 'Konfigurasi harga kategori ' . $kategori_nama . ' berhasil diperbarui.');
    }
}
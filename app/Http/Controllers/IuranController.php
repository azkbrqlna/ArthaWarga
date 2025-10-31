<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use Illuminate\Http\Request;

class IuranController extends Controller
{
    public function kat_iuran_create(Request $request)
    {
        $validated = $request->validate([
            'nm_kat' => 'required|string',
        ]);

        $kat_iuran = KategoriIuran::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil disimpan.',
            'data' => $kat_iuran,
        ]);
    }



    public function kat_iuran_delete($id)
    {
        $kategori = KategoriIuran::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Data kategori iuran tidak ditemukan.'
            ], 404);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data kategori iuran berhasil dihapus.'
        ]);
    }

    public function index()
    {
        return response()->json([
            'data' => PemasukanIuran::select('kat_iuran_id', 'tgl', 'nominal', 'ket', 'jml_kk', 'total')
                ->latest()
                ->get()
        ]);
    }

    public function iuran_create(Request $request)
    {
        $validated = $request->validate([
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
            'tgl' => 'required|date',
            'nominal' => 'required|numeric|min:0',
            'ket' => 'nullable|string',
        ]);

        $iuran = PemasukanIuran::create($validated);
       
        return back()->with('success', 'Data iuran berhasil disimpan.');
    }

    

}

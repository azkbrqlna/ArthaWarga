<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemasukanIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IuranApiController extends Controller
{
    /**
     * GET all data pemasukan iuran
     * @authenticated
     */
    public function index()
    {
        // PERBAIKAN: Menghapus 'usr_id' dari select karena kolom tersebut tidak ada di database
        $data = PemasukanIuran::with('kategori_iuran')
            ->select('id', 'kat_iuran_id', 'tgl', 'nominal', 'ket') 
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }


    /**
     * Create data pemasukan iuran
     */
    public function iuran_create(Request $request)
    {
        $validated = $request->validate([
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
            'tgl'          => 'required|date',
            'nominal'      => 'required|numeric|min:0',
            'ket'          => 'nullable|string',
        ]);

        // PERBAIKAN: Menghapus 'usr_id' dan 'status'
        $iuran = PemasukanIuran::create([
            // 'usr_id'        => Auth::id(), // HAPUS INI
            'kat_iuran_id'  => $validated['kat_iuran_id'],
            'tgl'           => $validated['tgl'],
            'nominal'       => $validated['nominal'],
            'ket'           => $validated['ket'],
            // 'status'        => 'approved', // HAPUS INI
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data iuran berhasil disimpan.',
            'data' => $iuran
        ]);
    }

    /**
     * PATCH / PUT untuk update iuran
     */
    public function iuran_update(Request $request, $id)
    {
        $iuran = PemasukanIuran::find($id);

        if (!$iuran) {
            return response()->json([
                'success' => false,
                'message' => 'Data iuran tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'kat_iuran_id' => 'sometimes|exists:kat_iuran,id',
            'tgl'          => 'sometimes|date',
            'nominal'      => 'sometimes|numeric|min:0',
            'ket'          => 'nullable|string',
        ]);

        $iuran->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data iuran berhasil diperbarui.',
            'data' => $iuran
        ]);
    }

    /**
     * DELETE iuran
     */
    public function iuran_delete($id)
    {
        $iuran = PemasukanIuran::find($id);

        if (!$iuran) {
            return response()->json([
                'success' => false,
                'message' => 'Data iuran tidak ditemukan.'
            ], 404);
        }

        $iuran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data iuran berhasil dihapus.'
        ]);
    }
}
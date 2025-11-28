<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;

class KategoriIuranApiController extends Controller
{
    /**
     * GET kategori iuran (kecuali Air & Kebersihan)
     */
    public function kategori()
    {
        $kategori = KategoriIuran::whereNotIn('id', [1, 2])->get();

        return response()->json([
            'success' => true,
            'data' => $kategori
        ]);
    }

    /**
     * create buat kategori iuran
     */
    public function kat_iuran_create(Request $request)
    {
        $validated = $request->validate([
            'nm_kat' => 'required|string',
        ]);

        $kategori = KategoriIuran::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori iuran berhasil disimpan.',
            'data' => $kategori,
        ]);
    }

    /**
     * Delete kategori iuran
     */
    public function kat_iuran_delete($id)
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
                'message' => 'Kategori digunakan di data iuran lain dan tidak dapat dihapus.'
            ], 400);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus.'
        ]);
    }

}


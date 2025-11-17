<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IuranApiController extends Controller
{
    public function index()
    {
        $data = PemasukanIuran::with('kategori')
            ->select('id', 'kat_iuran_id', 'tgl', 'nominal', 'ket', 'usr_id')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * GET kategori iuran (kecuali id 1 & 2)
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
     * POST buat kategori iuran
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
     * DELETE kategori iuran
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

    public function iuran_create(Request $request)
    {
        $validated = $request->validate([
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
            'tgl'          => 'required|date',
            'nominal'      => 'required|numeric|min:0',
            'ket'          => 'nullable|string',
        ]);

        $iuran = PemasukanIuran::create([
            'usr_id'        => Auth::id(),
            'kat_iuran_id'  => $validated['kat_iuran_id'],
            'tgl'           => $validated['tgl'],
            'nominal'       => $validated['nominal'],
            'ket'           => $validated['ket'],
            'status'        => 'approved',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data iuran berhasil disimpan.',
            'data' => $iuran
        ]);
    }
}

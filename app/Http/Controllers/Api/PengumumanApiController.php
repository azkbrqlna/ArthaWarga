<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use App\Models\User;
use Illuminate\Http\Request;

class PengumumanApiController extends Controller
{
    /**
     * GET - List semua pengumuman
     */
    public function index()
    {
        $pengumumans = Pengumuman::with('kategori')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $pengumumans
        ], 200);
    }

    /**
     * GET - Detail pengumuman
     */
    public function show($id)
    {
        $pengumuman = Pengumuman::with('kategori')->find($id);

        if (!$pengumuman) {
            return response()->json([
                'success' => false,
                'message' => 'Pengumuman tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $pengumuman
        ], 200);
    }

    /**
     * POST - Buat pengumuman baru + buat tagihan otomatis
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string',
            'ket' => 'required|string',
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
        ]);

        // Simpan pengumuman
        $pengumuman = Pengumuman::create([
            'judul' => $validated['judul'],
            'ket' => $validated['ket'],
            'kat_iuran_id' => $validated['kat_iuran_id'],
        ]);

        // Buat tagihan ke semua user
        $users = User::all();

        foreach ($users as $user) {
            PemasukanIuran::create([
                'usr_id' => $user->id,
                'kat_iuran_id' => $validated['kat_iuran_id'],
                'pengumuman_id' => $pengumuman->id,
                'tgl' => now(),
                'status' => 'tagihan',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil dibuat & tagihan otomatis dikirim',
            'data' => $pengumuman
        ], 201);
    }

    /**
     * PUT/PATCH - Update pengumuman
     */
    public function update(Request $request, $id)
    {
        $pengumuman = Pengumuman::find($id);

        if (!$pengumuman) {
            return response()->json([
                'success' => false,
                'message' => 'Pengumuman tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'judul' => 'required|string',
            'ket' => 'required|string',
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
        ]);

        $pengumuman->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman berhasil diperbarui',
            'data' => $pengumuman
        ], 200);
    }

    /**
     * DELETE - Hapus pengumuman + hapus tagihan terkait
     */
    public function destroy($id)
    {
        $pengumuman = Pengumuman::find($id);

        if (!$pengumuman) {
            return response()->json([
                'success' => false,
                'message' => 'Pengumuman tidak ditemukan'
            ], 404);
        }

        // hapus semua tagihan yang terkait
        PemasukanIuran::where('pengumuman_id', $id)->delete();

        $pengumuman->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman & tagihan terkait berhasil dihapus'
        ], 200);
    }
}

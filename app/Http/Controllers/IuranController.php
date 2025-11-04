<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IuranController extends Controller
{
    /**
     * Tambah kategori iuran
     */
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

    /**
     * Hapus kategori iuran (cek relasi dulu)
     */
    public function kat_iuran_delete($id)
    {
        $kategori = KategoriIuran::find($id);

        if (!$kategori) {
            return response()->json([
                'success' => false,
                'message' => 'Data kategori iuran tidak ditemukan.'
            ], 404);
        }

        $dipakai = PemasukanIuran::where('kat_iuran_id', $id)->exists();

        if ($dipakai) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori ini sudah digunakan di data iuran lain dan tidak dapat dihapus.'
            ], 400);
        }

        $kategori->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data kategori iuran berhasil dihapus.'
        ]);
    }

    /**
     * Ambil list data iuran
     */
    public function index()
    {
        $data = PemasukanIuran::select('kat_iuran_id', 'tgl', 'nominal', 'ket')
            ->latest()
            ->get();

        return response()->json(['data' => $data]);
    }

    /**
     * Simpan data iuran baru
     */
    public function iuran_create(Request $request)
    {
        $validated = $request->validate([
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
            'tgl' => 'required|date',
            'nominal' => 'required|numeric|min:0',
            'ket' => 'nullable|string',
        ]);

        $iuran = PemasukanIuran::create([
            'usr_id' => Auth::user()->id,
            'kat_iuran_id' => $validated['kat_iuran_id'],
            'tgl' => $validated['tgl'],
            'nominal' => $validated['nominal'],
            'ket' => $validated['ket'],
            'status' => 'approved',
        ]);
       
        return back()->with('success', 'Data iuran berhasil disimpan.');
    }

    
    public function pengumuman_create(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string',
            'ket' => 'required|string',
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
        ]);

        $pengumuman = Pengumuman::create([
            'judul' => $validated['judul'],
            'ket' => $validated['ket'],
            'kat_iuran_id' => $validated['kat_iuran_id'],
        ]);

        // $users = User::whereNotIn('role_id', [1, 2, 3, 4])->get();
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

        return back()->with('success', 'Pengumuman berhasil dibuat dan tagihan dikirim ke semua warga.');
    }
    
}
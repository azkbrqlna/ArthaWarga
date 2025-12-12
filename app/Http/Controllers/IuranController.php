<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class IuranController extends Controller
{
    // 💡 Fungsi yang menampilkan halaman form 'Ringkasan/Pemasukan'
    public function pemasukan()
    {
        // Ambil data kategori yang dikecualikan (Air/Sampah = ID 1 & 2)
        // Sesuai logika Transaksi Umum (7 Kategori)
        $kategori_iuran = KategoriIuran::whereNot('id', 1)->get();

        return Inertia::render('Ringkasan/Pemasukan', [
            'kategori_iuran' => $kategori_iuran
        ]);
    }

    // 💡 Fungsi untuk membuat kategori baru (kat_iuran_create)
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

    // 💡 Fungsi untuk menghapus kategori (kat_iuran_delete)
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

    // 💡 Fungsi untuk menampilkan daftar iuran (index)
    public function index()
    {
        $data = PemasukanIuran::select('kat_iuran_id', 'tgl', 'nominal', 'ket')
            ->latest()
            ->get();

        return response()->json(['data' => $data]);
    }

    /**
     * Menyimpan data Iuran Transaksi Umum (Oleh Pengurus RT).
     * Route: /iuran/create (name: iuran.create)
     */
    public function iuran_create(Request $request)
    {
        $validated = $request->validate([
            'kat_iuran_id' => 'required|integer|exists:kat_iuran,id', 
            'tgl'          => 'required|date',
            'nominal'      => 'required|integer|min:0', 
            'ket'          => 'nullable|string',
        ]);
        
        // 🛑 REVISI 2 & 3: Tambahkan usr_id dan status
        $validated['usr_id'] = Auth::id(); 
        $validated['status'] = 'approved'; 

        $validated['tgl_byr'] = null;

        try {
            PemasukanIuran::create($validated);
            
            return response()->json([
                'success' => true, 
                'message' => 'Data iuran umum berhasil disimpan.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal menyimpan data. ERROR: ' . $e->getMessage() 
            ], 500);
        }
    }
}
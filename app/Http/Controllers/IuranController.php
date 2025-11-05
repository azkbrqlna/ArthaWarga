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
    
    public function pemasukan()
    {
        $kategori_iuran = KategoriIuran::whereNotIn('id', [1, 2])->get();

        return Inertia::render('Ringkasan/Pemasukan', [
            'kategori_iuran' => $kategori_iuran
        ]);
    }
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

    public function index()
    {
        $data = PemasukanIuran::select('kat_iuran_id', 'tgl', 'nominal', 'ket')
            ->latest()
            ->get();

        return response()->json(['data' => $data]);
    }

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

    
}


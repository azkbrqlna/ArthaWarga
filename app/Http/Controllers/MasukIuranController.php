<?php

namespace App\Http\Controllers;

use App\Models\PemasukanIuran;
use App\Models\KategoriIuran; // Diperlukan untuk eager load relasi
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MasukIuranController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        
        // REVISI 1: Eager loading kategori_iuran, filter berdasarkan user dan kategori wajib (1, 2)
        $iurans = PemasukanIuran::with(['kategori_iuran']) 
            ->where('usr_id', $userId)
            ->whereIn('kat_iuran_id', [1, 2])
            ->orderByDesc('tgl')
            ->paginate(10)
            ->withQueryString();
        
        // Statistik Tagihan Wajib
        $totalIuran = PemasukanIuran::where('usr_id', $userId)->whereIn('kat_iuran_id', [1, 2])->count();

        $unpaidIuran = PemasukanIuran::where('usr_id', $userId)
            ->where('status', 'tagihan')->whereIn('kat_iuran_id', [1, 2])
            ->count();

        $paidIuran = PemasukanIuran::where('usr_id', $userId)
            ->where('status', 'approved')->whereIn('kat_iuran_id', [1, 2])
            ->count();

        return Inertia::render('Warga/MasukIuranIndex', [
            'iurans' => $iurans,
            'totalIuran' => $totalIuran,
            'pendingIuran' => $unpaidIuran,
            'paidIuran' => $paidIuran
        ]);
    }

    public function show($id)
    {
        // Relasi dikoreksi ke kategori_iuran
        $iuran = PemasukanIuran::with(['kategori_iuran'])->findOrFail($id);

        if ($iuran->usr_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        return Inertia::render('Warga/MasukIuranShow', [
            'iuran' => $iuran,
        ]);
    }

    /**
     * Menyimpan data (Upload Bukti Bayar Tagihan Wajib)
     */
    public function store(Request $request)
    {
        // 💡 Validasi untuk UPLOAD BUKTI BAYAR
        $validated = $request->validate([
            'id'      => 'required|integer|exists:masuk_iuran,id', // ID baris tagihan yang mau dibayar
            'bkt_byr' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $userId = Auth::id();

        // Cari baris tagihan berdasarkan ID yang dikirim dari form
        $targetIuran = PemasukanIuran::findOrFail($validated['id']);
        
        // Otorisasi: Pastikan user yang upload adalah pemilik tagihan
        if ($targetIuran->usr_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        // Logic upload file
        if ($request->hasFile('bkt_byr')) {
            // Hapus file lama jika ada
            if ($targetIuran->bkt_byr) {
                Storage::disk('public')->delete($targetIuran->bkt_byr);
            }
            
            $file = $request->file('bkt_byr');
            $filename = now()->format('Ymd_His') . '_' . $userId . '_bktbyr.' . $file->getClientOriginalExtension();
            $targetIuran->bkt_byr = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        // Update status dan tanggal bayar
        $targetIuran->tgl_byr = now();
        $targetIuran->status = 'pending'; 
        $targetIuran->save();

        return response()->json([
            'success' => true, 
            'message' => 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.'
        ], 200);
    }
}
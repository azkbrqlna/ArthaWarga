<?php

namespace App\Http\Controllers;

use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use App\Models\KategoriIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MasukIuranController extends Controller
{
    /**
     * List iuran milik user yang login.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $iurans = PemasukanIuran::with(['pengumuman.kat_iuran'])
            ->where('usr_id', $userId)
            ->orderByDesc('tgl')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Warga/MasukIuranIndex', [
            'iurans' => $iurans,
        ]);
    }

    /**
     * Tampilkan detail iuran + form upload bukti bayar.
     */
    public function show($id)
    {
        $iuran = PemasukanIuran::with(['pengumuman.kat_iuran'])
            ->findOrFail($id);

        // Pastikan hanya user pemilik yang bisa lihat
        if ($iuran->usr_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        return Inertia::render('Warga/MasukIuranShow', [
            'iuran' => $iuran,
        ]);
    }

    /**
     * Simpan upload bukti bayar (ubah status jadi pending).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bkt_byr'  => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bkt_nota' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'nominal'  => 'required|numeric|min:1000',
            'ket'      => 'nullable|string|max:255',
            'id'       => 'required|integer|exists:masuk_iuran,id',
        ]);

        $iuran = PemasukanIuran::findOrFail($validated['id']);

        // Pastikan hanya user terkait yang bisa ubah
        if ($iuran->usr_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        // Upload bukti bayar
        if ($request->hasFile('bkt_byr')) {
            $file = $request->file('bkt_byr');
            $filename = now()->format('Ymd_His') . '_bktbyr.' . $file->getClientOriginalExtension();
            $iuran->bkt_byr = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        // Upload bukti nota 
        if ($request->hasFile('bkt_nota')) {
            $file = $request->file('bkt_nota');
            $filename = now()->format('Ymd_His') . '_bktnota.' . $file->getClientOriginalExtension();
            $iuran->bkt_nota = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        // Update status
        $iuran->update([
            'nominal' => $validated['nominal'],
            'ket' => $validated['ket'] ?? null,
            'tgl_byr' => now(),
            'status' => 'pending',
        ]);

        return redirect()->route('masuk-iuran.index')->with('success', 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.');
    }

    /**
     * Halaman form manual (opsional)
     */
    public function create()
    {
        return Inertia::render('Warga/MasukIuranUpload');
    }

    /**
     * Update dan hapus (opsional)
     */
    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}

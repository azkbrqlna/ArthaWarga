<?php

namespace App\Http\Controllers;

use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MasukIuranController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $pengumuman = Pengumuman::all();

        $iurans = PemasukanIuran::with(['pengumuman.kat_iuran'])
            ->where('usr_id', $userId)
            ->orderByDesc('tgl')
            ->paginate(10)
            ->withQueryString();
        
        $totalIuran = PemasukanIuran::where('usr_id', $userId)->count();

        $unpaidIuran = PemasukanIuran::where('usr_id', $userId)
            ->where('status', 'tagihan')
            ->count();

        $paidIuran = PemasukanIuran::where('usr_id', $userId)
            ->where('status', 'approved')
            ->count();

        return Inertia::render('Warga/MasukIuranIndex', [
            'iurans' => $iurans,
            'pengumuman' => $pengumuman,
            'totalIuran' => $totalIuran,
            'pendingIuran' => $unpaidIuran,
            'paidIuran' => $paidIuran
        ]);
    }

    public function show($id)
    {
        $iuran = PemasukanIuran::with(['pengumuman.kat_iuran'])->findOrFail($id);

        if ($iuran->usr_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        return Inertia::render('Warga/MasukIuranShow', [
            'iuran' => $iuran,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id'       => 'required|integer|exists:masuk_iuran,id',
            'bkt_byr'  => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $iuran = PemasukanIuran::findOrFail($validated['id']);

        if ($iuran->usr_id !== Auth::id()) {
            abort(403, 'Akses ditolak.');
        }

        // Upload bukti bayar
        if ($request->hasFile('bkt_byr')) {
            $file = $request->file('bkt_byr');
            $filename = now()->format('Ymd_His') . '_bktbyr.' . $file->getClientOriginalExtension();
            $iuran->bkt_byr = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        // Update status
        $iuran->update([
            'tgl_byr' => now(),
            'status' => 'pending',
        ]);

        return redirect()->route('masuk-iuran.index')
            ->with('success', 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.');
    }
}

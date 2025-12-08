<?php

namespace App\Http\Controllers;

use App\Models\PemasukanIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MasukIuranController extends Controller
{
    public function index()
    {
        $userId = Auth::id();


        $iurans = PemasukanIuran::with(['pengumuman.kat_iuran'])
            ->where('usr_id', $userId)
            ->whereIn('kat_iuran_id', [1, 2])
            ->orderByDesc('tgl')
            ->paginate(10)
            ->withQueryString();
        
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

        $userId = Auth::id();

        $targetIuran = PemasukanIuran::findOrFail($validated['id']);
        if ($targetIuran->usr_id !== $userId) {
            abort(403, 'Akses ditolak.');
        }

        // cari tagihan tertua milik user yang status 'tagihan' dengan urutan berdasarkan pengumuman.created_at
        $oldestTagihan = PemasukanIuran::join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->where('masuk_iuran.usr_id', $userId)
            ->where('masuk_iuran.status', 'tagihan')
            ->orderBy('pengumuman.created_at')   // periode berdasarkan waktu bikin pengumuman
            ->orderBy('masuk_iuran.tgl')
            ->select('masuk_iuran.*')
            ->first();

        // kalau tidak ada tagihan lama, target = iuran yang di-klik user
        $applyTo = $oldestTagihan ?? $targetIuran;

        // upload file
        if ($request->hasFile('bkt_byr')) {
            $file = $request->file('bkt_byr');
            $filename = now()->format('Ymd_His') . '_bktbyr.' . $file->getClientOriginalExtension();
            $applyTo->bkt_byr = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        $applyTo->tgl_byr = now();
        $applyTo->status = 'pending';
        $applyTo->save();

        return redirect()->route('masuk-iuran.index')
            ->with('success', 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.');
    }

}
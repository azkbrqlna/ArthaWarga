<?php

namespace App\Http\Controllers;

use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use App\Models\KategoriIuran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class MasukIuranController extends Controller
{
    /**
     * List semua data iuran (Inertia)
     */
    public function index(Request $request)
    {
        $query = PemasukanIuran::query();

        if ($request->filled('usr_id')) {
            $query->where('usr_id', $request->usr_id);
        }

        if ($request->filled('q')) {
            $query->where('ket', 'like', '%' . $request->q . '%');
        }

        $items = $query->latest()
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('Warga/MasukIuran', [
            'masuk_iuran' => $items,
        ]);
    }

    /**
     * Form tambah iuran (Inertia)
     */
    public function create()
    {
        $pengumumans = Pengumuman::select('id', 'judul', 'kat_iuran_id')->latest()->get();
        $kats = KategoriIuran::select('id', 'nm_kat')->get();

        return Inertia::render('Iuran/Create', [
            'pengumumans' => $pengumumans,
            'kategori_iuran' => $kats,
        ]);
    }

    /**
     * Simpan data iuran baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'usr_id'        => 'nullable|integer|exists:users,id',
            'pengumuman_id' => 'nullable|integer|exists:pengumuman,id',
            'kat_iuran_id'  => 'nullable|integer|exists:kat_iuran,id',
            'tgl'           => 'required|date',
            'nominal'       => 'nullable|numeric|min:0',
            'ket'           => 'nullable|string',
            'bkt_byr'       => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bkt_nota'      => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ], [
            'tgl.required' => 'Tanggal wajib diisi.',
            'tgl.date' => 'Format tanggal tidak valid.',
            'nominal.numeric' => 'Nominal harus berupa angka.',
            'nominal.min' => 'Nominal tidak boleh negatif.',
            'bkt_byr.mimes' => 'Format file bukti bayar harus jpg, jpeg, png, atau pdf.',
            'bkt_nota.mimes' => 'Format file bukti nota harus jpg, jpeg, png, atau pdf.',
        ]);

        // default status = pending
        $validated['status'] = 'pending';

        // Simpan file upload jika ada
        if ($request->hasFile('bkt_byr')) {
            $file = $request->file('bkt_byr');
            $filename = now()->format('Ymd_His') . '_bktbyr.' . $file->getClientOriginalExtension();
            $validated['bkt_byr'] = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        if ($request->hasFile('bkt_nota')) {
            $file = $request->file('bkt_nota');
            $filename = now()->format('Ymd_His') . '_bktnota.' . $file->getClientOriginalExtension();
            $validated['bkt_nota'] = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        PemasukanIuran::create($validated);

        return redirect()->back()->with('success', 'Data iuran berhasil dikirim (status: pending).');
    }

    /**
     * Detail iuran tertentu
     */
    public function show($id)
    {
        $item = PemasukanIuran::findOrFail($id);

        return Inertia::render('Iuran/Show', [
            'masuk_iuran' => $item,
        ]);
    }

    /**
     * Form edit iuran
     */
    public function edit($id)
    {
        $item = PemasukanIuran::findOrFail($id);
        $pengumumans = Pengumuman::select('id', 'judul', 'kat_iuran_id')->latest()->get();
        $kats = KategoriIuran::select('id', 'nm_kat')->get();

        return Inertia::render('Iuran/Edit', [
            'masuk_iuran' => $item,
            'pengumumans' => $pengumumans,
            'kategori_iuran' => $kats,
        ]);
    }

    /**
     * Update data iuran
     */
    public function update(Request $request, $id)
    {
        $item = PemasukanIuran::findOrFail($id);

        $validated = $request->validate([
            'usr_id'        => 'nullable|integer|exists:users,id',
            'pengumuman_id' => 'nullable|integer|exists:pengumuman,id',
            'kat_iuran_id'  => 'nullable|integer|exists:kat_iuran,id',
            'tgl'           => 'required|date',
            'nominal'       => 'nullable|numeric|min:0',
            'ket'           => 'nullable|string',
            'bkt_byr'       => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bkt_nota'      => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'status'        => 'nullable|in:tagihan,pending,approved,rejected',
        ]);

        // Ganti file jika upload baru
        if ($request->hasFile('bkt_byr')) {
            if ($item->bkt_byr && Storage::disk('public')->exists($item->bkt_byr)) {
                Storage::disk('public')->delete($item->bkt_byr);
            }
            $file = $request->file('bkt_byr');
            $filename = now()->format('Ymd_His') . '_bktbyr.' . $file->getClientOriginalExtension();
            $validated['bkt_byr'] = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        if ($request->hasFile('bkt_nota')) {
            if ($item->bkt_nota && Storage::disk('public')->exists($item->bkt_nota)) {
                Storage::disk('public')->delete($item->bkt_nota);
            }
            $file = $request->file('bkt_nota');
            $filename = now()->format('Ymd_His') . '_bktnota.' . $file->getClientOriginalExtension();
            $validated['bkt_nota'] = $file->storeAs('masuk_iuran', $filename, 'public');
        }

        $item->update($validated);

        return redirect()->back()->with('success', 'Data iuran berhasil diperbarui.');
    }

    /**
     * Hapus data iuran
     */
    public function destroy($id)
    {
        $item = PemasukanIuran::findOrFail($id);

        if ($item->bkt_byr && Storage::disk('public')->exists($item->bkt_byr)) {
            Storage::disk('public')->delete($item->bkt_byr);
        }
        if ($item->bkt_nota && Storage::disk('public')->exists($item->bkt_nota)) {
            Storage::disk('public')->delete($item->bkt_nota);
        }

        $item->delete();

        return redirect()->back()->with('success', 'Data iuran berhasil dihapus.');
    }
}

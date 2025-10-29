<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class KegiatanController extends Controller
{
    /**
     * Tampilkan list kegiatan (Inertia).
     */
    public function index(Request $request)
    {
        // simple search & pagination
        $query = Kegiatan::query();

        if ($request->filled('q')) {
            $query->where('nm_keg', 'like', '%' . $request->input('q') . '%');
        }

        $kegiatans = $query->orderBy('tgl_mulai', 'desc')
                           ->paginate($request->input('per_page', 10))
                           ->withQueryString();

        return Inertia::render('Kegiatan/Index', [
            'kegiatans' => $kegiatans
        ]);
    }

    /**
     * Tampilkan detail kegiatan (Inertia).
     */
    public function show($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        return Inertia::render('Kegiatan/Show', [
            'kegiatan' => $kegiatan
        ]);
    }

    /**
     * Simpan kegiatan baru.
     * Mirip dengan contoh BOP: validasi + upload file bukti (dok_keg)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nm_keg'      => ['required', 'string', 'max:255'],
            'tgl_mulai'   => ['nullable', 'date'],
            'tgl_selesai' => ['nullable', 'date', 'after_or_equal:tgl_mulai'],
            'pj_keg'      => ['nullable', 'string', 'max:255'],
            'panitia'     => ['nullable', 'string', 'max:255'],
            // sesuaikan mimes jika mau (jpg,jpeg,png,pdf)
            'dok_keg'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ], [
            'nm_keg.required' => 'Nama kegiatan wajib diisi.',
            'nm_keg.max' => 'Nama kegiatan terlalu panjang.',
            'tgl_mulai.date' => 'Format tanggal mulai tidak valid.',
            'tgl_selesai.date' => 'Format tanggal selesai tidak valid.',
            'tgl_selesai.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
            'pj_keg.max' => 'Panjang penanggung jawab terlalu panjang.',
            'panitia.max' => 'Panjang panitia terlalu panjang.',
            'dok_keg.file' => 'Dokumentasi harus berupa file.',
            'dok_keg.mimes' => 'Format dokumentasi harus jpg, jpeg, png, atau pdf.',
            'dok_keg.max' => 'Ukuran dokumentasi maksimal 5MB.',
        ]);

        // handle dok_keg upload jika ada
        if ($request->hasFile('dok_keg')) {
            $file = $request->file('dok_keg');
            $extension = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_keg.' . $extension;
            // simpan di storage/app/public/keg/
            $path = $file->storeAs('keg', $filename, 'public');
            // simpan relatif path tanpa prefix 'public/'
            $validated['dok_keg'] = $path; // e.g. 'keg/20251020_123000_keg.jpg'
        } else {
            // jika kolom DB tidak nullable dan butuh value, set ke empty string
            // (sesuaikan kalau migrasi DB mengizinkan null)
            $validated['dok_keg'] = $validated['dok_keg'] ?? '';
        }

        $kegiatan = Kegiatan::create($validated);

        return redirect()->back()->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    /**
     * Update kegiatan.
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        $validated = $request->validate([
            'nm_keg'      => ['required', 'string', 'max:255'],
            'tgl_mulai'   => ['nullable', 'date'],
            'tgl_selesai' => ['nullable', 'date', 'after_or_equal:tgl_mulai'],
            'pj_keg'      => ['nullable', 'string', 'max:255'],
            'panitia'     => ['nullable', 'string', 'max:255'],
            'dok_keg'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ], [
            'nm_keg.required' => 'Nama kegiatan wajib diisi.',
            'nm_keg.max' => 'Nama kegiatan terlalu panjang.',
            'dok_keg.mimes' => 'Format dokumentasi harus jpg, jpeg, png, atau pdf.',
            'dok_keg.max' => 'Ukuran dokumentasi maksimal 5MB.',
        ]);

        // jika upload dok_keg baru, hapus file lama (jika ada) lalu simpan file baru
        if ($request->hasFile('dok_keg')) {
            if ($kegiatan->dok_keg && Storage::disk('public')->exists($kegiatan->dok_keg)) {
                Storage::disk('public')->delete($kegiatan->dok_keg);
            }

            $file = $request->file('dok_keg');
            $extension = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_keg.' . $extension;
            $path = $file->storeAs('keg', $filename, 'public');
            $validated['dok_keg'] = $path;
        } else {
            // jika tidak upload baru, pertahankan nilai lama
            $validated['dok_keg'] = $kegiatan->dok_keg ?? ($validated['dok_keg'] ?? '');
        }

        $kegiatan->update($validated);

        return redirect()->back()->with('success', 'Kegiatan berhasil diupdate.');
    }

    /**
     * Hapus kegiatan.
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        // hapus file dokumentasi kalau ada
        if ($kegiatan->dok_keg && Storage::disk('public')->exists($kegiatan->dok_keg)) {
            Storage::disk('public')->delete($kegiatan->dok_keg);
        }

        $kegiatan->delete();

        return redirect()->back()->with('success', 'Kegiatan berhasil dihapus.');
    }
}

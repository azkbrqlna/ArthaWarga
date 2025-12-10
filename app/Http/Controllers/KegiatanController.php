<?php

namespace App\Http\Controllers;

use App\Models\KategoriKegiatan;
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
        $query = Kegiatan::query();

        if ($request->filled('q')) {
            $query->where('nm_keg', 'like', '%' . $request->input('q') . '%');
        }

        $kegiatans = $query->orderBy('tgl_mulai', 'desc')
                           ->paginate($request->input('per_page', 10))
                           ->withQueryString();

        return Inertia::render('Kegiatan/Kegiatan', [
            'kegiatans' => $kegiatans
        ]);

    }

    /**
     * Tampilkan detail kegiatan (Inertia).
     */
    public function show($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        return Inertia::render('Ringkasan/KegiatanShow', [
            'kegiatan' => $kegiatan
        ]);
    }

    public function create()
    {
        $kategoris = KategoriKegiatan::select('id', 'nm_kat')->get();
        return Inertia::render('Kegiatan/Tambah_kegiatan',[
            'kategoris' => $kategoris
        ]);
    }

    /**
     * Simpan kegiatan baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'kat_keg_id'  => 'required|exists:kat_keg,id', // Tambahkan validasi ini
            'nm_keg'      => 'required|string|max:255',
            'tgl_mulai'   => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'      => 'nullable|string|max:255',
            'panitia'     => 'nullable|string|max:255',
            
            // Validasi untuk array (upload banyak file)
            'dok_keg'     => 'nullable|array', 
            'dok_keg.*'   => 'file|mimes:jpg,jpeg,png|max:5120', // Validasi per file
        ]);

        $paths = []; // Array untuk menampung nama file

        if ($request->hasFile('dok_keg')) {
            foreach ($request->file('dok_keg') as $index => $file) {
                // Tambahkan index/uniqid agar nama file tidak bentrok saat upload barengan
                $filename = now()->format('Ymd_His') . '_' . $index . '_keg.' . $file->getClientOriginalExtension();
                
                // Simpan file dan masukkan path ke array
                $paths[] = $file->storeAs('keg', $filename, 'public');
            }
        }

        // Masukkan data ke array untuk disimpan
        // Karena di Model sudah di-cast 'array', Laravel otomatis mengubah array PHP jadi JSON
        $data['dok_keg'] = !empty($paths) ? $paths : null;

        
        Kegiatan::create($data);
        
        return back()->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    /**
     * Update kegiatan.
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        $data = $request->validate([
            'nm_keg'      => 'required|string|max:255',
            'tgl_mulai'   => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'      => 'nullable|string|max:255',
            'panitia'     => 'nullable|string|max:255',
            'dok_keg'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($request->hasFile('dok_keg')) {
            // hapus file lama jika ada
            if ($kegiatan->dok_keg && Storage::disk('public')->exists($kegiatan->dok_keg)) {
                Storage::disk('public')->delete($kegiatan->dok_keg);
            }

            $file = $request->file('dok_keg');
            $filename = now()->format('Ymd_His') . '_keg.' . $file->getClientOriginalExtension();
            $data['dok_keg'] = $file->storeAs('keg', $filename, 'public');
        } else {
            // pertahankan nilai lama jika tidak upload baru
            $data['dok_keg'] = $kegiatan->dok_keg ?? ($data['dok_keg'] ?? '');
        }

        $kegiatan->update($data);

        return back()->with('success', 'Kegiatan berhasil diupdate.');
    }

    /**
     * Hapus kegiatan.
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        if ($kegiatan->dok_keg && Storage::disk('public')->exists($kegiatan->dok_keg)) {
            Storage::disk('public')->delete($kegiatan->dok_keg);
        }

        $kegiatan->delete();

        return back()->with('success', 'Kegiatan berhasil dihapus.');
    }

   


}
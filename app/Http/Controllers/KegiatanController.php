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
            'kat_keg_id'  => 'required|exists:kat_keg,id', // Pastikan validasi kategori ada
            
            // UBAH VALIDASI MENJADI ARRAY
            'dok_keg'     => 'nullable|array', 
            'dok_keg.*'   => 'file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($request->hasFile('dok_keg')) {
            // 1. HAPUS FILE LAMA (Looping karena formatnya Array)
            if ($kegiatan->dok_keg) {
                // Pastikan tipe data array agar bisa di-loop
                $oldFiles = is_array($kegiatan->dok_keg) ? $kegiatan->dok_keg : [$kegiatan->dok_keg];
                
                foreach ($oldFiles as $oldFile) {
                    if (Storage::disk('public')->exists($oldFile)) {
                        Storage::disk('public')->delete($oldFile);
                    }
                }
            }

            // 2. UPLOAD FILE BARU (Looping seperti fungsi store)
            $paths = [];
            foreach ($request->file('dok_keg') as $index => $file) {
                $filename = now()->format('Ymd_His') . '_' . $index . '_keg.' . $file->getClientOriginalExtension();
                $paths[] = $file->storeAs('keg', $filename, 'public');
            }
            
            // Simpan array path baru
            $data['dok_keg'] = $paths;
        } else {
            // Jika tidak ada file baru yg diupload, buang key 'dok_keg' dari array data
            // agar data lama tidak tertimpa null/kosong
            unset($data['dok_keg']);
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

        // Cek apakah kolom dok_keg ada isinya
        if (!empty($kegiatan->dok_keg)) {
            // Pastikan formatnya array (jaga-jaga kalau ada data lama yg masih string)
            $files = is_array($kegiatan->dok_keg) ? $kegiatan->dok_keg : [$kegiatan->dok_keg];

            // Looping untuk hapus satu per satu
            foreach ($files as $file) {
                if (Storage::disk('public')->exists($file)) {
                    Storage::disk('public')->delete($file);
                }
            }
        }

        $kegiatan->delete();

        return back()->with('success', 'Kegiatan berhasil dihapus.');
    }

   public function edit($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $kategoris = KategoriKegiatan::select('id', 'nm_kat')->get();

        return Inertia::render('Kegiatan/Tambah_kegiatan', [
            'kategoris' => $kategoris,
            'kegiatan'  => $kegiatan // Kirim data kegiatan yang mau diedit
        ]);
    }


}
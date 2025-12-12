<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class KegiatanController extends Controller
{
    /**
     * Tampilkan list kegiatan.
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
     * Tampilkan detail kegiatan (Rincian).
     */
    public function show($id)
    {
        // 1. Ambil data kegiatan beserta relasinya
        // Menggunakan 'with' untuk mengambil SEMUA pengeluaran terkait
        $kegiatan = Kegiatan::with(['pengeluaran', 'kategori_relasi'])->findOrFail($id);

        // 2. Format URL Dokumentasi (Support Multiple Files / JSON)
        $dokumenUrls = [];
        if ($kegiatan->dok_keg) {
            // Pastikan formatnya array (Model sudah cast 'array')
            // Jika data lama masih string, bungkus jadi array
            $files = is_array($kegiatan->dok_keg) ? $kegiatan->dok_keg : [$kegiatan->dok_keg];
            
            foreach ($files as $path) {
                if (is_string($path)) {
                    // Bersihkan tanda kutip jika ada sisa data lama
                    $cleanPath = str_replace('"', '', $path);
                    // Buat URL lengkap
                    $dokumenUrls[] = url('storage/' . $cleanPath);
                }
            }
        }
        
        // Kirim array URL ke frontend
        $kegiatan->dokumentasi_urls = $dokumenUrls;
        // Fallback single url
        $kegiatan->dokumentasi_url = !empty($dokumenUrls) ? $dokumenUrls[0] : null;

        // 3. Nama Kategori
        $kegiatan->kategori = $kegiatan->kategori_relasi ? $kegiatan->kategori_relasi->nm_kat : '-';

        // 4. DATA PENGELUARAN (LOGIKA BANYAK DATA)
        // Hitung total nominal dari semua item pengeluaran
        $totalPengeluaran = $kegiatan->pengeluaran->sum('nominal');

        // Siapkan list pengeluaran dengan URL Nota yang benar
        $listPengeluaran = $kegiatan->pengeluaran->map(function ($item) {
            if ($item->bkt_nota) {
                $cleanNota = str_replace('"', '', $item->bkt_nota);
                $item->bkt_nota_url = url('storage/' . $cleanNota);
            } else {
                $item->bkt_nota_url = null;
            }
            return $item;
        });

        // 5. HITUNG SISA DANA GLOBAL (Sesuai Logika DashboardController Terbaru)
        
        // --- Hitung Saldo BOP ---
        $totalBop = PemasukanBOP::sum('nominal');
        // Pengeluaran BOP ditandai dengan adanya 'masuk_bop_id'
        $keluarBop = Pengeluaran::whereNotNull('masuk_bop_id')->sum('nominal');
        $sisaBop = $totalBop - $keluarBop;

        // --- Hitung Saldo Iuran ---
        $totalIuran = PemasukanIuran::sum('nominal'); 
        // Pengeluaran Iuran ditandai dengan adanya 'masuk_iuran_id'
        $keluarIuran = Pengeluaran::whereNotNull('masuk_iuran_id')->sum('nominal');
        $sisaIuran = $totalIuran - $keluarIuran;

        // 6. Cek Izin Akses
        $userRole = Auth::user()->role_id;
        $canAddExpense = in_array($userRole, [2, 3]);

        return Inertia::render('Kegiatan/Detail', [
            'kegiatan' => $kegiatan,
            'totalPengeluaran' => $totalPengeluaran, // Total Sum semua pengeluaran
            'listPengeluaran' => $listPengeluaran,   // List Array rincian belanja
            'canAddExpense' => $canAddExpense,
            'sisaBop' => $sisaBop,
            'sisaIuran' => $sisaIuran
        ]);
    }

    /**
     * Halaman Form Tambah Kegiatan
     */
    public function create()
    {
        $kategoris = KategoriKegiatan::select('id', 'nm_kat')->get();
        return Inertia::render('Kegiatan/Tambah_kegiatan', [
            'listKategori' => $kategoris 
        ]);
    }

    /**
     * Simpan kegiatan baru.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nm_keg'           => 'required|string|max:255',
            'tgl_mulai'        => 'nullable|date',
            'tgl_selesai'      => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'           => 'nullable|string|max:255',
            'panitia'          => 'nullable|string|max:255',
            // Validasi Array File
            'dok_keg'          => 'nullable|array', 
            'dok_keg.*'        => 'file|mimes:jpg,jpeg,png,pdf|max:5120', 
            'kat_keg_id'       => 'required|exists:kat_keg,id',
            'rincian_kegiatan' => 'nullable|string'
        ]);

        // Logic Multiple Upload
        $paths = [];
        if ($request->hasFile('dok_keg')) {
            foreach ($request->file('dok_keg') as $index => $file) {
                // Beri nama unik dengan index
                $filename = now()->format('Ymd_His') . '_' . $index . '_keg.' . $file->getClientOriginalExtension();
                $paths[] = $file->storeAs('keg', $filename, 'public');
            }
        }

        // Simpan array path (Laravel otomatis convert ke JSON krn casts di Model)
        $data['dok_keg'] = !empty($paths) ? $paths : null;

        Kegiatan::create($data);

        return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    /**
     * Halaman Edit Kegiatan
     */
    public function edit($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        $kategoris = KategoriKegiatan::select('id', 'nm_kat')->get();

        return Inertia::render('Kegiatan/Tambah_kegiatan', [
            'listKategori' => $kategoris,
            'kegiatan' => $kegiatan 
        ]);
    }

    /**
     * Update kegiatan.
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        $data = $request->validate([
            'nm_keg'           => 'required|string|max:255',
            'tgl_mulai'        => 'nullable|date',
            'tgl_selesai'      => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'           => 'nullable|string|max:255',
            'panitia'          => 'nullable|string|max:255',
            'dok_keg'          => 'nullable|array',
            'dok_keg.*'        => 'file|mimes:jpg,jpeg,png,pdf|max:5120',
            'kat_keg_id'       => 'nullable|exists:kat_keg,id',
            'rincian_kegiatan' => 'nullable|string'
        ]);

        // Jika user upload file baru
        if ($request->hasFile('dok_keg')) {
            // Hapus file lama (Looping)
            if ($kegiatan->dok_keg) {
                $oldFiles = is_array($kegiatan->dok_keg) ? $kegiatan->dok_keg : [$kegiatan->dok_keg];
                foreach ($oldFiles as $oldFile) {
                    if(is_string($oldFile)) {
                        $cleanOldFile = str_replace('"', '', $oldFile);
                        if (Storage::disk('public')->exists($cleanOldFile)) {
                            Storage::disk('public')->delete($cleanOldFile);
                        }
                    }
                }
            }

            // Simpan file baru (Looping)
            $paths = [];
            foreach ($request->file('dok_keg') as $index => $file) {
                $filename = now()->format('Ymd_His') . '_' . $index . '_keg.' . $file->getClientOriginalExtension();
                $paths[] = $file->storeAs('keg', $filename, 'public');
            }
            $data['dok_keg'] = $paths;
        } else {
            // Jika tidak ada file baru, jangan ubah kolom dok_keg
            unset($data['dok_keg']);
        }

        $kegiatan->update($data);

        return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil diupdate.');
    }

    /**
     * Hapus kegiatan.
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);
        
        // Hapus banyak file
        if ($kegiatan->dok_keg) {
            $files = is_array($kegiatan->dok_keg) ? $kegiatan->dok_keg : [$kegiatan->dok_keg];
            foreach ($files as $file) {
                if(is_string($file)) {
                    $cleanFile = str_replace('"', '', $file);
                    if (Storage::disk('public')->exists($cleanFile)) {
                        Storage::disk('public')->delete($cleanFile);
                    }
                }
            }
        }
        
        $kegiatan->delete();
        return back()->with('success', 'Kegiatan berhasil dihapus.');
    }
}
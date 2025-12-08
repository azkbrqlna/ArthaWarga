<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\KatKeg;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Pengeluaran;
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

        // Fitur Pencarian
        if ($request->filled('q')) {
            $query->where('nm_keg', 'like', '%' . $request->input('q') . '%');
        }

        // Ambil data, urutkan dari yang terbaru, dan paginasi
        $kegiatans = $query->orderBy('tgl_mulai', 'desc')
                           ->paginate($request->input('per_page', 10))
                           ->withQueryString();

        return Inertia::render('Kegiatan/Kegiatan', [
            'kegiatans' => $kegiatans
        ]);
    }

    /**
     * Tampilkan detail kegiatan (Inertia).
     * DIGUNAKAN DI HALAMAN RINCIAN
     */
    public function show($id)
    {
        // 1. Ambil kegiatan BESERTA pengeluaran DAN relasi kategori
        $kegiatan = Kegiatan::with(['pengeluaran', 'kategori_relasi'])->findOrFail($id);

        // 2. Format URL Dokumentasi agar bisa tampil di frontend
        if ($kegiatan->dok_keg) {
            // Bersihkan tanda kutip jika ada (bugfix data lama)
            $cleanPath = str_replace('"', '', $kegiatan->dok_keg); 
            $kegiatan->dokumentasi_url = url('storage/' . $cleanPath);
        } else {
            $kegiatan->dokumentasi_url = null;
        }

        // 3. Masukkan nama kategori ke properti 'kategori' 
        $kegiatan->kategori = $kegiatan->kategori_relasi ? $kegiatan->kategori_relasi->nm_kat : '-';

        // 4. Data Nominal Pengeluaran Kegiatan Ini
        $totalPengeluaran = 0;
        if ($kegiatan->pengeluaran) {
            $totalPengeluaran = $kegiatan->pengeluaran->nominal;
            
            // Format URL Bukti Nota Pengeluaran
            if ($kegiatan->pengeluaran->bkt_nota) {
                $cleanNota = str_replace('"', '', $kegiatan->pengeluaran->bkt_nota);
                $kegiatan->pengeluaran->bkt_nota_url = url('storage/' . $cleanNota);
            }
        }

        // 5. HITUNG SISA SALDO BOP & IURAN (Global Real-time)
        // Agar Frontend bisa menghitung "Dana Awal = Sisa Sekarang + Pengeluaran Ini"
        
        // --- Hitung Saldo BOP ---
        $totalBop = PemasukanBOP::sum('nominal');
        $keluarBop = Pengeluaran::where('tipe', 'bop')->sum('nominal');
        $sisaBop = $totalBop - $keluarBop;

        // --- Hitung Saldo Iuran ---
        // Iuran Manual
        $totalIuranManual = PemasukanIuran::where('status', 'approved')
            ->whereNull('pengumuman_id')
            ->sum('nominal');
        
        // Iuran Tagihan (Approved)
        $jumlahApproved = PemasukanIuran::where('masuk_iuran.status', 'approved')
            ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->sum('pengumuman.jumlah');
        
        $totalIuran = $totalIuranManual + $jumlahApproved;
        $keluarIuran = Pengeluaran::where('tipe', 'iuran')->sum('nominal');
        $sisaIuran = $totalIuran - $keluarIuran;


        // 6. Cek Izin Tambah Pengeluaran (Hanya RT=2 dan Bendahara=3)
        $userRole = auth()->user()->role_id;
        $canAddExpense = in_array($userRole, [2, 3]);

        return Inertia::render('Kegiatan/Detail', [
            'kegiatan' => $kegiatan,
            'totalPengeluaran' => $totalPengeluaran,
            'canAddExpense' => $canAddExpense,
            'sisaBop' => $sisaBop,     // Dikirim ke frontend
            'sisaIuran' => $sisaIuran  // Dikirim ke frontend
        ]);
    }

    /**
     * Halaman Tambah Kegiatan (Form)
     */
    public function create()
    {
        // Ambil list kategori untuk dropdown
        $kategori = KatKeg::all();
        
        return Inertia::render('Kegiatan/Tambah_kegiatan', [
            'listKategori' => $kategori
        ]);
    }

    /**
     * Simpan kegiatan baru ke database.
     */
    public function store(Request $request)
    {
        // Validasi Input
        $data = $request->validate([
            'nm_keg'           => 'required|string|max:255',
            'tgl_mulai'        => 'nullable|date',
            'tgl_selesai'      => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'           => 'nullable|string|max:255',
            'panitia'          => 'nullable|string|max:255',
            'dok_keg'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'kat_keg_id'       => 'nullable', 
            'rincian_kegiatan' => 'nullable|string'
        ]);

        // Proses Upload File
        if ($request->hasFile('dok_keg')) {
            $file = $request->file('dok_keg');
            $filename = now()->format('Ymd_His') . '_keg.' . $file->getClientOriginalExtension();
            $data['dok_keg'] = $file->storeAs('keg', $filename, 'public');
        } else {
            $data['dok_keg'] = '';
        }

        // Simpan ke Database
        Kegiatan::create($data);

        // Redirect kembali ke daftar kegiatan
        return redirect()->route('kegiatan.index')->with('success', 'Kegiatan berhasil ditambahkan.');
    }

    /**
     * Update data kegiatan yang sudah ada.
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
            'dok_keg'          => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'kat_keg_id'       => 'nullable',
            'rincian_kegiatan' => 'nullable|string'
        ]);

        // Cek jika ada file baru diupload
        if ($request->hasFile('dok_keg')) {
            // Hapus file lama jika ada & bersihkan path
            $oldPath = str_replace('"', '', $kegiatan->dok_keg);
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            // Simpan file baru
            $file = $request->file('dok_keg');
            $filename = now()->format('Ymd_His') . '_keg.' . $file->getClientOriginalExtension();
            $data['dok_keg'] = $file->storeAs('keg', $filename, 'public');
        } else {
            // Jika tidak ada file baru, hapus key dok_keg agar data lama tidak tertimpa null
            unset($data['dok_keg']);
        }

        $kegiatan->update($data);

        return back()->with('success', 'Kegiatan berhasil diupdate.');
    }

    /**
     * Hapus kegiatan beserta fotonya.
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::findOrFail($id);

        // Hapus file fisik di storage
        $path = str_replace('"', '', $kegiatan->dok_keg);
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        // Hapus data di database
        $kegiatan->delete();

        return back()->with('success', 'Kegiatan berhasil dihapus.');
    }
}
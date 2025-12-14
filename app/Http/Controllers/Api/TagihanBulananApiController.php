<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TagihanBulanan;
use App\Models\KategoriIuran;
use App\Models\HargaIuran;
use App\Models\PemasukanIuran;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class TagihanBulananApiController extends Controller
{
    // --- MIDDLWARE (Tambahkan di route API) ---
    // Pastikan Anda mendaftarkan middleware role/auth di file routes/api.php
    
    /**
     * Lihat daftar tagihan dan ringkasna keuangan (RT)
     */
    public function indexRt(Request $request)
    {
        // Pengecekan role (jika tidak menggunakan middleware)
        if (!in_array(Auth::user()->role_id, [1, 2])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // 1. Ambil data tagihan (bisa ditambahkan filter/pagination jika diperlukan)
        $tagihan = TagihanBulanan::with(['user:id,nm_lengkap', 'kategori:id,nm_kat'])
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            // Tambahkan pagination agar tidak membebani server jika data banyak
            ->paginate($request->get('per_page', 15));

        // 2. HITUNG TOTAL KEUANGAN (Agregasi di database untuk performa)
        $ringkasan = [
            'total_ditagihkan' => TagihanBulanan::whereIn('status', ['ditagihkan', 'pending'])->sum('nominal'),
            'total_lunas'      => TagihanBulanan::where('status', 'approved')->sum('nominal'),
            'total_jimpitan'   => TagihanBulanan::where('status', 'approved')->sum('jimpitan_air'),
        ];
        
        return response()->json([
            'data'      => $tagihan->items(),
            'pagination' => [
                'total'        => $tagihan->total(),
                'per_page'     => $tagihan->perPage(),
                'current_page' => $tagihan->currentPage(),
                'last_page'    => $tagihan->lastPage(),
            ],
            'ringkasan' => $ringkasan,
        ]);
    }

    /**
     * Lihat daftar tagihan (Warga)
     */
    public function indexWarga(Request $request)
    {
        $tagihan = TagihanBulanan::with(['user:id,nm_lengkap', 'kategori:id,nm_kat'])
            ->where('usr_id', Auth::id())
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'data'      => $tagihan->items(),
            'pagination' => [
                'total'        => $tagihan->total(),
                'per_page'     => $tagihan->perPage(),
                'current_page' => $tagihan->currentPage(),
                'last_page'    => $tagihan->lastPage(),
            ]
        ]);
    }
    
    // =========================================================================
    // HELPER FUNCTION
    // =========================================================================
    
    /**
     * Fungsi Helper untuk mencari konfigurasi Harga Air
     * @return array
     * @throws ValidationException
     */
    private function getAirConfig()
    {
        $kategoriAir = KategoriIuran::where('nm_kat', 'LIKE', '%Air%')->first();
        if (!$kategoriAir) {
            throw ValidationException::withMessages(['kategori' => 'Kategori Air tidak ditemukan di master data!']);
        }
        
        $masterHarga = HargaIuran::where('kat_iuran_id', $kategoriAir->id)->first();
        if (!$masterHarga) {
            throw ValidationException::withMessages(['harga' => 'Konfigurasi harga Air belum disetting!']);
        }

        return [
            'kat_iuran_id' => $kategoriAir->id,
            'harga_meter'  => $masterHarga->harga_meteran ?? 0,
            'abonemen'     => $masterHarga->abonemen ?? 0,
            'jimpitan'     => $masterHarga->jimpitan_air ?? 0,
            'harga_sampah_master' => $masterHarga->harga_sampah ?? 0,
        ];
    }


    // =========================================================================
    // ADMIN/RT FUNCTIONS (CRUD)
    // =========================================================================

    /**
     * Create tagihan (RT)
     */
    public function store(Request $request)
    {
        // Pengecekan role (jika tidak menggunakan middleware)
        if (!in_array(Auth::user()->role_id, [1, 2])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        
        try {
            $validated = $request->validate([
                'usr_id'       => 'required|exists:usr,id',
                'bulan'        => 'required|integer|min:1|max:12',
                'tahun'        => 'required|integer|min:2024',
                'mtr_bln_lalu' => 'required|integer|min:0',
                'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu',
                'pakai_sampah' => 'required|boolean',
            ]);

            // Cek duplikasi
            $exists = TagihanBulanan::where('usr_id', $validated['usr_id'])
                ->where('bulan', $validated['bulan'])
                ->where('tahun', $validated['tahun'])
                ->exists();
            
            if ($exists) {
                return response()->json(['message' => 'Tagihan untuk warga ini di periode tersebut sudah ada.'], 409);
            }

            // Ambil konfigurasi harga
            $config = $this->getAirConfig();

            $harga_meter = $config['harga_meter'];
            $abonemen    = $config['abonemen'];
            $jimpitan    = $config['jimpitan'];
            // Ambil harga sampah dari master karena ini adalah pembuatan tagihan baru
            $harga_sampah = $validated['pakai_sampah'] ? $config['harga_sampah_master'] : 0;

            $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
            $nominal   = ($pemakaian * $harga_meter) + $abonemen + $jimpitan + $harga_sampah;

            $tagihan = TagihanBulanan::create([
                'kat_iuran_id'  => $config['kat_iuran_id'],
                'usr_id'        => $validated['usr_id'],
                'bulan'         => $validated['bulan'],
                'tahun'         => $validated['tahun'],
                'mtr_bln_lalu'  => $validated['mtr_bln_lalu'],
                'mtr_skrg'      => $validated['mtr_skrg'],
                'status'        => 'ditagihkan',
                'harga_meteran' => $harga_meter,
                'abonemen'      => $abonemen,
                'jimpitan_air'  => $jimpitan,
                'harga_sampah'  => $harga_sampah,
                'nominal'       => $nominal
            ]);

            return response()->json(['message' => 'Tagihan berhasil dibuat!', 'data' => $tagihan], 201);
            
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update tagihan (RT)
     */
    public function update(Request $request, $id)
    {
        // Pengecekan role
        if (!in_array(Auth::user()->role_id, [1, 2])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $tagihan = TagihanBulanan::findOrFail($id);
            
            $validated = $request->validate([
                'usr_id'       => 'required|exists:usr,id',
                'bulan'        => 'required|integer|min:1|max:12',
                'tahun'        => 'required|integer|min:2024',
                'mtr_bln_lalu' => 'required|integer|min:0',
                'mtr_skrg'     => 'required|integer|gte:mtr_bln_lalu',
                'pakai_sampah' => 'required|boolean',
            ]);

            // Cek duplikasi (kecuali dirinya sendiri)
            $exists = TagihanBulanan::where('usr_id', $validated['usr_id'])
                ->where('bulan', $validated['bulan'])
                ->where('tahun', $validated['tahun'])
                ->where('id', '!=', $id)
                ->exists();
            
            if ($exists) {
                return response()->json(['message' => 'Tagihan untuk warga ini di periode tersebut sudah ada.'], 409);
            }

            // Ambil harga dari record tagihan yang ada (untuk konsistensi)
            $h_meter    = $tagihan->harga_meteran;
            $h_abo      = $tagihan->abonemen;
            $h_jimpitan = $tagihan->jimpitan_air;
            $h_sampah_master_saat_ini = 0;

            // Logika harga sampah saat update
            if ($validated['pakai_sampah']) {
                if ($tagihan->harga_sampah > 0) {
                    // Jika sebelumnya sudah terpasang harga, gunakan harga yang sama
                    $h_sampah = $tagihan->harga_sampah;
                } else {
                    // Jika sebelumnya tidak pakai sampah (h_sampah = 0), ambil harga master saat ini
                    $config = $this->getAirConfig();
                    $h_sampah = $config['harga_sampah_master'];
                    $h_sampah_master_saat_ini = $h_sampah; // Simpan harga master saat ini jika berubah dari 0
                }
            } else {
                $h_sampah = 0;
            }

            $pemakaian = $validated['mtr_skrg'] - $validated['mtr_bln_lalu'];
            $nominal   = ($pemakaian * $h_meter) + $h_abo + $h_jimpitan + $h_sampah;

            $tagihan->update([
                'usr_id'       => $validated['usr_id'],
                'bulan'        => $validated['bulan'],
                'tahun'        => $validated['tahun'],
                'mtr_bln_lalu' => $validated['mtr_bln_lalu'],
                'mtr_skrg'     => $validated['mtr_skrg'],
                'harga_sampah' => $h_sampah,
                'nominal'      => $nominal
            ]);

            return response()->json(['message' => 'Data tagihan berhasil diperbarui.', 'data' => $tagihan]);
            
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Tagihan tidak ditemukan atau error: ' . $e->getMessage()], 404);
        }
    }
    
    /**
     * Hapus tagihan (RT)
     */
    public function destroy($id)
    {
        // Pengecekan role
        if (!in_array(Auth::user()->role_id, [1, 2])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        
        try {
            $tagihan = TagihanBulanan::findOrFail($id);
            // Anda mungkin ingin menambahkan pengecekan: hanya tagihan status 'ditagihkan' yang boleh dihapus
            $tagihan->delete();
            return response()->json(['message' => 'Tagihan berhasil dihapus.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus tagihan atau tagihan tidak ditemukan.'], 404);
        }
    }
    
    /**
     * Approve tagihan (RT)
     */
    public function approve($id)
    {
        // Pengecekan role
        if (!in_array(Auth::user()->role_id, [1, 2])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        
        $tagihan = TagihanBulanan::findOrFail($id);

        if ($tagihan->status === 'approved') {
            return response()->json(['message' => 'Tagihan sudah diapprove.'], 409);
        }

        DB::beginTransaction();
        try {
            $tagihan->update([
                'status' => 'approved',
                'tgl_approved' => now(),
            ]);

            $jimpitan = $tagihan->jimpitan_air ?? 0;

            // Catat Jimpitan sebagai Pemasukan
            if ($jimpitan > 0) {
                PemasukanIuran::create([
                    'usr_id'       => $tagihan->usr_id,
                    'kat_iuran_id' => $tagihan->kat_iuran_id, 
                    'tgl'          => now(),
                    'nominal'      => $jimpitan,
                    'ket'          => 'Jimpitan Air (Auto) - ' . $tagihan->bulan . '/' . $tagihan->tahun,
                    'status'       => 'approved',
                ]);
            }
            DB::commit();
            return response()->json(['message' => 'Tagihan disetujui. Dana Jimpitan masuk kas.'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyetujui tagihan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Decline tagihan (RT)
     */
    public function decline($id)
    {
        // Pengecekan role
        if (!in_array(Auth::user()->role_id, [1, 2])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        
        $tagihan = TagihanBulanan::findOrFail($id);
        $tagihan->status = 'ditagihkan';
        $tagihan->tgl_byr = null; // Hapus tanggal bayar
        $tagihan->bkt_byr = null; // Hapus bukti bayar (Opsional, tergantung kebijakan Anda)
        $tagihan->save();

        return response()->json(['message' => 'Tagihan ditolak dan dikembalikan ke status "ditagihkan".'], 200);
    }
    
    // =========================================================================
    // WARGA FUNCTIONS
    // =========================================================================

    /**
     * Upload bukti bayar (Warga)
     */
    public function uploadBukti(Request $request)
    {
        try {
            $validated = $request->validate([
                'id'        => 'required|integer|exists:tagihan_bulanan,id', // ID Tagihan
                // Hapus batasan PDF jika tidak diperlukan
                'bkt_byr'   => 'required|file|mimes:jpg,jpeg,png|max:2048', 
            ]);

            $userId = Auth::id();
            $targetTagihan = TagihanBulanan::findOrFail($validated['id']);

            // Security Check: Pastikan yang upload adalah pemilik tagihan
            if ($targetTagihan->usr_id !== $userId) {
                return response()->json(['message' => 'Akses ditolak.'], 403);
            }
            
            // Check status
            if ($targetTagihan->status === 'approved') {
                return response()->json(['message' => 'Tagihan ini sudah lunas.'], 409);
            }


            // Proses Upload
            if ($request->hasFile('bkt_byr')) {
                $file = $request->file('bkt_byr');
                // Nama file unik: Ymd_His_IDTagihan.ext
                $filename = now()->format('Ymd_His') . '_' . $targetTagihan->id . '_bktbyr.' . $file->getClientOriginalExtension();
                
                // Hapus bukti bayar lama jika ada
                if ($targetTagihan->bkt_byr && Storage::disk('public')->exists($targetTagihan->bkt_byr)) {
                    Storage::disk('public')->delete($targetTagihan->bkt_byr);
                }
                
                $targetTagihan->bkt_byr = $file->storeAs('bukti_air', $filename, 'public');
            }

            // Update Status & Tanggal Bayar
            $targetTagihan->tgl_byr = now();
            $targetTagihan->status  = 'pending';
            $targetTagihan->save();

            return response()->json(['message' => 'Bukti pembayaran berhasil diupload. Menunggu persetujuan admin.', 'data' => $targetTagihan], 200);
        
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan saat upload bukti: ' . $e->getMessage()], 500);
        }
    }
}
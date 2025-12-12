<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class KegiatanApiController extends Controller
{
    // Fungsi helper untuk mengonversi JSON string (dari DB) menjadi array (untuk Response dan Logic)
    protected function prepareKegiatanForResponse($kegiatan)
    {
        // Pastikan model Kegiatan memiliki property $casts = ['dok_keg' => 'array'];
        // Jika tidak, kita harus melakukan json_decode secara manual di sini.
        if (is_string($kegiatan->dok_keg)) {
            $kegiatan->dok_keg = json_decode($kegiatan->dok_keg, true) ?? [];
        } elseif (is_null($kegiatan->dok_keg)) {
            $kegiatan->dok_keg = [];
        }
        return $kegiatan;
    }

    /**
     * GET semua kegiatan
     */
    public function index()
    {
        $data = Kegiatan::orderBy('tgl_mulai', 'desc')->get();

        // Siapkan data untuk response
        $data->transform(fn ($item) => $this->prepareKegiatanForResponse($item));

        return response()->json([
            'success' => true,
            'data'    => $data
        ]);
    }

    /**
     * GET detail kegiatan
     */
    public function show($id)
    {
        $kegiatan = Kegiatan::find($id);

        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        // Siapkan data untuk response
        $kegiatan = $this->prepareKegiatanForResponse($kegiatan);

        return response()->json([
            'success' => true,
            'data'    => $kegiatan
        ]);
    }

    /**
     * POST tambah kegiatan
     */
    public function store(Request $request)
    {
        // 1. Validasi
        // Gunakan Validator::make secara eksplisit agar bisa menggunakan $validator->sometimes()
        // Ini memastikan validasi dok_keg hanya berjalan jika dok_keg ada
        $validator = Validator::make($request->all(), [
            'nm_keg'      => 'required|string|max:255',
            'tgl_mulai'   => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'      => 'nullable|string|max:255',
            'panitia'     => 'nullable|string|max:255',
            // File upload: array, dan setiap item harus berupa file dengan kriteria tertentu
            'dok_keg'     => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:5120', // Maks 5MB per file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal validasi data kegiatan',
                'errors'  => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();
        $uploadedPaths = [];
        
        // 2. Proses upload file
        if ($request->hasFile('dok_keg')) {
            foreach ($request->file('dok_keg') as $file) {
                // Walaupun sudah divalidasi, kita tetap memastikan file valid
                if ($file && $file->isValid()) {
                    $extension = $file->getClientOriginalExtension();
                    $filename = now()->format('Ymd_His') . '_' . uniqid() . '_keg.' . $extension;

                    $path = $file->storeAs('keg', $filename, 'public');
                    $uploadedPaths[] = $path;
                }
            }
        }
        
        // 3. Masukkan array path ke dalam data. Akan disimpan sebagai JSON atau NULL.
        // Jika model Kegiatan memiliki $casts = ['dok_keg' => 'array'], 
        // Laravel akan otomatis mengonversi array ke JSON string saat menyimpan.
        $validatedData['dok_keg'] = !empty($uploadedPaths) ? $uploadedPaths : null;


        // 4. Create
        $kegiatan = Kegiatan::create($validatedData);
        
        // Siapkan data untuk response
        $kegiatan = $this->prepareKegiatanForResponse($kegiatan);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dibuat',
            'data'    => $kegiatan
        ], 201);
    }

    /**
     * UPDATE kegiatan
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::find($id);

        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        // 1. Validasi
        $validator = Validator::make($request->all(), [
            'nm_keg'           => 'sometimes|required|string|max:255',
            'tgl_mulai'        => 'sometimes|nullable|date',
            'tgl_selesai'      => 'sometimes|nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'           => 'sometimes|nullable|string|max:255',
            'panitia'          => 'sometimes|nullable|string|max:255',
            // Field ini dikirim dari frontend untuk file yang tidak ingin dihapus
            'existing_dok_keg' => 'sometimes|nullable|array', 
            // File upload baru
            'dok_keg.*'        => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal validasi data kegiatan',
                'errors'  => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();
        $newlyUploadedPaths = [];

        // 2. Ambil path file lama yang dipertahankan
        $existingPaths = $request->input('existing_dok_keg');
        if (!is_array($existingPaths)) {
            $existingPaths = [];
        }
        
        // 3. Proses upload file baru
        if ($request->hasFile('dok_keg')) {
            foreach ($request->file('dok_keg') as $file) {
                if ($file && $file->isValid()) {
                    $extension = $file->getClientOriginalExtension();
                    $filename = now()->format('Ymd_His') . '_' . uniqid() . '_keg.' . $extension;
                    $path = $file->storeAs('keg', $filename, 'public');
                    $newlyUploadedPaths[] = $path;
                }
            }
        }
        
        // 4. Gabungkan semua path (lama yang dipertahankan + yang baru di-upload)
        $finalPaths = array_merge($existingPaths, $newlyUploadedPaths);
        
        // 5. Hapus file yang lama yang TIDAK dipertahankan
        // Ambil path yang sudah ada di database (sudah di-decode oleh helper)
        $currentPaths = $this->prepareKegiatanForResponse($kegiatan)->dok_keg ?? [];
        
        // Cari perbedaan (file yang ada di DB TAPI TIDAK ada di finalPaths)
        $filesToDelete = array_diff($currentPaths, $finalPaths);
        
        foreach ($filesToDelete as $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
        
        // 6. Set data dok_keg untuk update
        $validatedData['dok_keg'] = !empty($finalPaths) ? $finalPaths : null;
        
        // Hapus key helper yang tidak diperlukan di database
        unset($validatedData['existing_dok_keg']);

        // 7. Update
        $kegiatan->update($validatedData);
        
        // Siapkan data untuk response
        $kegiatan = $this->prepareKegiatanForResponse($kegiatan);

        return response()->json([
            'success' => true,
            'message' => 'Data kegiatan berhasil diperbarui.',
            'data'    => $kegiatan
        ], 200);
    }

    /**
     * DELETE kegiatan
     */
    public function destroy($id)
    {
        $kegiatan = Kegiatan::find($id);

        if (!$kegiatan) {
            return response()->json([
                'success' => false,
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        // Ambil array path file (sudah dipastikan dalam format array oleh helper)
        $filePaths = $this->prepareKegiatanForResponse($kegiatan)->dok_keg;

        // Loop dan hapus setiap file
        if (is_array($filePaths)) {
            foreach ($filePaths as $path) {
                if ($path && Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $kegiatan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dihapus'
        ]);
    }
}
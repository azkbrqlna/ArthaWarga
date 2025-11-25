<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemasukanBOP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator; 

/**
 * @OA\Tag(
 * name="BOP",
 * description="API untuk manajemen pemasukan BOP"
 * )
 */
class BopApiController extends Controller
{

    /**
     * @OA\Get(
     * path="/api/bop",
     * summary="Ambil semua data pemasukan BOP",
     * tags={"BOP"},
     * security={{"bearerAuth":{}}},
     *
     * @OA\Response(
     * response=200,
     * description="Data berhasil diambil"
     * )
     * )
     */
    public function index()
    {
        $data = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota')
            ->latest()
            ->get();

        return response()->json([
            'status'    => true,
            'message' => 'Data berhasil diambil.',
            'data'    => $data
        ]);
    }

    /**
     * @OA\Post(
     * path="/api/bop/create",
     * summary="Tambah pemasukan BOP",
     * tags={"BOP"},
     * security={{"bearerAuth":{}}},
     *
     * @OA\RequestBody(
     * required=true,
     * @OA\MediaType(
     * mediaType="multipart/form-data",
     * @OA\Schema(
     * required={"tgl", "nominal", "ket", "bkt_nota"}, // PASTIKAN bkt_nota ADA DI SINI JUGA
     *
     * @OA\Property(
     * property="tgl",
     * type="string",
     * format="date",
     * example="2025-01-25"
     * ),
     * @OA\Property(
     * property="nominal",
     * type="number",
     * format="float",
     * example=250000
     * ),
     * @OA\Property(
     * property="ket",
     * type="string",
     * example="Pembelian ATK"
     * ),
     * @OA\Property(
     * property="bkt_nota",
     * description="Upload file nota (jpg, jpeg, png, pdf) - WAJIB",
     * type="string",
     * format="binary",
     * nullable=false // Ubah ini
     * )
     * )
     * )
     * ),
     *
     * @OA\Response(
     * response=201,
     * description="Data berhasil disimpan"
     * )
     * )
     */
    public function bop_create(Request $request)
    {
        // 1. Ubah aturan validasi bkt_nota dari 'nullable' menjadi 'required'
        $validated = $request->validate([
            'tgl'       => 'required|date',
            'nominal'   => 'required|numeric|min:0',
            'ket'       => 'required|string',
            // PERUBAHAN UTAMA DI SINI
            'bkt_nota'  => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048', 
        ]);

        // 2. Karena bkt_nota sudah diatur required, kita TIDAK perlu lagi 
        //    memeriksa hasFile() atau mengatur nilai default null.
        //    Kita hanya perlu memastikan proses upload berjalan.
        
        // Cek ini hanya untuk berjaga-jaga (walaupun seharusnya sudah terjamin oleh validasi 'required')
        if ($request->hasFile('bkt_nota')) { 
            $file       = $request->file('bkt_nota');
            $extension  = $file->getClientOriginalExtension();
            $filename   = now()->format('Ymd_His') . '_nota.' . $extension;

            $path = $file->storeAs('nota_bop', $filename, 'public');
            $validated['bkt_nota'] = $path; // Path file akan disimpan
        } else {
            // Ini tidak akan tercapai jika validasi 'required' berfungsi, 
            // tetapi jika tercapai, itu berarti validasi gagal.
            // Anda bisa melempar exception kustom di sini jika diperlukan,
            // namun Laravel akan melakukannya secara otomatis.
            // Untuk keamanan, kita tambahkan ini.
            return response()->json([
                'status' => false,
                'message' => 'File bukti nota wajib diunggah.'
            ], 422);
        }

        // 3. Buat Data di Database
        // Ini akan berhasil karena $validated sekarang DIJAMIN memiliki 'bkt_nota'
        $data = PemasukanBOP::create($validated);

        return response()->json([
            'status'    => true,
            'message' => 'Data berhasil disimpan!',
            'data'    => $data
        ], 201);
    }

    // ... (method destroy, update, dll. tetap sama)
    
    /**
     * @OA\Delete(
     * path="/api/bop/delete/{id}",
     * summary="Hapus pemasukan BOP",
     * tags={"BOP"},
     * security={{"bearerAuth":{}}},
     *
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID data BOP",
     * @OA\Schema(type="integer")
     * ),
     *
     * @OA\Response(
     * response=200,
     * description="Data berhasil dihapus"
     * ),
     * @OA\Response(
     * response=404,
     * description="Data tidak ditemukan"
     * )
     * )
     */
    public function destroy($id)
    {
        $data = PemasukanBOP::find($id);

        if (!$data) {
            return response()->json([
                'status'    => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        if ($data->bkt_nota && Storage::disk('public')->exists($data->bkt_nota)) {
            Storage::disk('public')->delete($data->bkt_nota);
        }

        $data->delete();

        return response()->json([
            'status'    => true,
            'message' => 'Data berhasil dihapus.'
        ]);
    }

    /**
     * @OA\Post(
     * path="/api/bop/update/{id}",
     * summary="Perbarui pemasukan BOP",
     * tags={"BOP"},
     * security={{"bearerAuth":{}}},
     *
     * @OA\Parameter(
     * name="id",
     * in="path",
     * required=true,
     * description="ID data BOP",
     * @OA\Schema(type="integer")
     * ),
     *
     * @OA\RequestBody(
     * required=false,
     * @OA\MediaType(
     * mediaType="multipart/form-data",
     * @OA\Schema(
     * @OA\Property(
     * property="tgl",
     * type="string",
     * format="date",
     * example="2025-02-01"
     * ),
     * @OA\Property(
     * property="nominal",
     * type="number",
     * format="float",
     * example=300000
     * ),
     * @OA\Property(
     * property="ket",
     * type="string",
     * example="Perbaikan printer"
     * ),
     * @OA\Property(
     * property="bkt_nota",
     * description="Upload nota baru (opsional)",
     * type="string",
     * format="binary",
     * nullable=true
     * )
     * )
     * )
     * ),
     *
     * @OA\Response(
     * response=200,
     * description="Data berhasil diperbarui"
     * ),
     * @OA\Response(
     * response=404,
     * description="Data tidak ditemukan"
     * )
     * )
     */
    public function update(Request $request, $id)
    {
        $data = PemasukanBOP::find($id);

        if (!$data) {
            return response()->json([
                'status'    => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            // Saat update, tgl, nominal, ket bisa diabaikan (nullable)
            'tgl'       => 'nullable|date',
            'nominal'   => 'nullable|numeric|min:0',
            'ket'       => 'nullable|string',
            // File bkt_nota saat update tetap nullable (opsional)
            'bkt_nota'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($request->hasFile('bkt_nota')) {
            // Hapus file lama jika ada
            if ($data->bkt_nota && Storage::disk('public')->exists($data->bkt_nota)) {
                Storage::disk('public')->delete($data->bkt_nota);
            }

            $file       = $request->file('bkt_nota');
            $extension  = $file->getClientOriginalExtension();
            $filename   = now()->format('Ymd_His') . '_nota.' . $extension;

            $path = $file->storeAs('nota_bop', $filename, 'public');
            $validated['bkt_nota'] = $path;
        } 
        
        $data->update($validated);

        return response()->json([
            'status'    => true,
            'message' => 'Data berhasil diperbarui.',
            'data'    => $data
        ]);
    }
}
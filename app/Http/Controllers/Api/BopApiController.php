<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemasukanBOP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Tag(
 *     name="BOP",
 *     description="API untuk manajemen pemasukan BOP"
 * )
 */
class BopApiController extends Controller
{

    /**
     * Get all data pemasukan BOP 
     * @authenticated
     * @OA\Get(
     *     path="/api/bop",
     *     summary="Ambil semua data pemasukan BOP",
     *     tags={"BOP"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Data berhasil diambil"
     *     )
     * )
     */
    public function index()
    {
        $data = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota')
            ->latest()
            ->get();

        return response()->json([
            'status'  => true,
            'message' => 'Data berhasil diambil.',
            'data'    => $data
        ]);
    }

    /**
     * Create data pemasukan BOP 
     * @authenticated
     * @OA\Post(
     *     path="/api/bop/create",
     *     summary="Tambah pemasukan BOP",
     *     tags={"BOP"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"tgl", "nominal", "ket"},
     *
     *                 @OA\Property(
     *                     property="tgl",
     *                     type="string",
     *                     format="date",
     *                     example="2025-01-25"
     *                 ),
     *                 @OA\Property(
     *                     property="nominal",
     *                     type="number",
     *                     format="float",
     *                     example=250000
     *                 ),
     *                 @OA\Property(
     *                     property="ket",
     *                     type="string",
     *                     example="Pembelian ATK"
     *                 ),
     *                 @OA\Property(
     *                     property="bkt_nota",
     *                     description="Upload file nota (jpg, jpeg, png, pdf)",
     *                     type="string",
     *                     format="binary",
     *                     nullable=true
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Data berhasil disimpan"
     *     )
     * )
     */
    public function bop_create(Request $request)
    {
        $validated = $request->validate([
            'tgl'       => 'required|date',
            'nominal'   => 'required|numeric|min:0',
            'ket'       => 'required|string',
            'bkt_nota'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($request->hasFile('bkt_nota')) {
            $file      = $request->file('bkt_nota');
            $extension = $file->getClientOriginalExtension();
            $filename  = now()->format('Ymd_His') . '_nota.' . $extension;

            $path = $file->storeAs('nota_bop', $filename, 'public');
            $validated['bkt_nota'] = $path;
        }

        $data = PemasukanBOP::create($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Data berhasil disimpan!',
            'data'    => $data
        ], 201);
    }

    /**
     * Delete data pemasukan BOP by ID
     * @authenticated
     * @OA\Delete(
     *     path="/api/bop/delete/{id}",
     *     summary="Hapus pemasukan BOP",
     *     tags={"BOP"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID data BOP",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Data berhasil dihapus"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Data tidak ditemukan"
     *     )
     * )
     */
    public function destroy($id)
    {
        $data = PemasukanBOP::find($id);

        if (!$data) {
            return response()->json([
                'status'  => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        if ($data->bkt_nota && Storage::disk('public')->exists($data->bkt_nota)) {
            Storage::disk('public')->delete($data->bkt_nota);
        }

        $data->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Data berhasil dihapus.'
        ]);
    }

    /**
     * Update data pemasukan BOP By ID
     * @authenticated
     * @OA\Post(
     *     path="/api/bop/update/{id}",
     *     summary="Perbarui pemasukan BOP",
     *     tags={"BOP"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID data BOP",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="tgl",
     *                     type="string",
     *                     format="date",
     *                     example="2025-02-01"
     *                 ),
     *                 @OA\Property(
     *                     property="nominal",
     *                     type="number",
     *                     format="float",
     *                     example=300000
     *                 ),
     *                 @OA\Property(
     *                     property="ket",
     *                     type="string",
     *                     example="Perbaikan printer"
     *                 ),
     *                 @OA\Property(
     *                     property="bkt_nota",
     *                     description="Upload nota baru (opsional)",
     *                     type="string",
     *                     format="binary",
     *                     nullable=true
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Data berhasil diperbarui"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Data tidak ditemukan"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $data = PemasukanBOP::find($id);

        if (!$data) {
            return response()->json([
                'status'  => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'tgl'       => 'nullable|date',
            'nominal'   => 'nullable|numeric|min:0',
            'ket'       => 'nullable|string',
            'bkt_nota'  => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($request->hasFile('bkt_nota')) {
            if ($data->bkt_nota && Storage::disk('public')->exists($data->bkt_nota)) {
                Storage::disk('public')->delete($data->bkt_nota);
            }

            $file      = $request->file('bkt_nota');
            $extension = $file->getClientOriginalExtension();
            $filename  = now()->format('Ymd_His') . '_nota.' . $extension;

            $path = $file->storeAs('nota_bop', $filename, 'public');
            $validated['bkt_nota'] = $path;
        }

        $data->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Data berhasil diperbarui.',
            'data'    => $data
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PengeluaranApiController extends Controller
{
    // GET: List all pengeluaran
    /**
     * Lihat daftar pengeluaran
     */
    public function index()
    {
        $data = Pengeluaran::with('kegiatan')
            ->select('id','tgl','keg_id','nominal','ket','bkt_nota')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil.',
            'data' => $data
        ]);
    }

    // GET: Detail pengeluaran by ID
    /**
     * Lihat detail pengeluaran by ID
     */
    public function show($id)
    {
        $data = Pengeluaran::with('kegiatan')->find($id);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // POST: Create pengeluaran
    /**
     * Menambah pengeluaran
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tgl' => 'required|date',
            'keg_id' => 'required|exists:keg,id',
            'nominal' => 'required|numeric|min:0',
            'ket' => 'required|string',
            'bkt_nota' => 'required|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('bkt_nota')) {
            $file = $request->file('bkt_nota');
            $extension = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_nota.' . $extension;
            $path = $file->storeAs('nota_pengeluaran', $filename, 'public');
            $validated['bkt_nota'] = $path;
        }

        $data = Pengeluaran::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengeluaran berhasil dibuat',
            'data' => $data
        ], 201);
    }

    // PUT/PATCH: Update pengeluaran
    /**
     * Update pengeluaran
     */
    public function update(Request $request, $id)
    {
        $data = Pengeluaran::find($id);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        $validated = $request->validate([
            'tgl' => 'sometimes|date',
            'keg_id' => 'sometimes|exists:keg,id',
            'nominal' => 'sometimes|numeric|min:0',
            'ket' => 'sometimes|string',
            'bkt_nota' => 'sometimes|required|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('bkt_nota')) {

            if ($data->bkt_nota && Storage::disk('public')->exists($data->bkt_nota)) {
                Storage::disk('public')->delete($data->bkt_nota);
            }

            $file = $request->file('bkt_nota');
            $ext  = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_nota.' . $ext;

            $path = $file->storeAs('nota_pengeluaran', $filename, 'public');
            $validated['bkt_nota'] = $path;
        }

        $data->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diperbarui.',
            'data' => $data
        ]);
    }

    // DELETE: Delete pengeluaran
    /**
     * Menghapus pengeluaran
     */
    public function destroy($id)
    {
        $data = Pengeluaran::find($id);

        if (!$data) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak ditemukan.'
            ], 404);
        }

        if ($data->bkt_nota && Storage::disk('public')->exists($data->bkt_nota)) {
            Storage::disk('public')->delete($data->bkt_nota);
        }

        $data->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dihapus.'
        ]);
    }
}
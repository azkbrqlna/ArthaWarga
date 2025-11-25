<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KegiatanApiController extends Controller
{
    /**
     * GET semua kegiatan
     */
    public function index()
    {
        $data = Kegiatan::orderBy('tgl_mulai', 'desc')->get();

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
        $data = $request->validate([
            'nm_keg'      => 'required|string|max:255',
            'tgl_mulai'   => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'      => 'nullable|string|max:255',
            'panitia'     => 'nullable|string|max:255',
            'dok_keg'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        if ($request->hasFile('dok_keg')) {
            $filename = now()->format('Ymd_His') . '_keg.' 
                      . $request->file('dok_keg')->getClientOriginalExtension();

            $data['dok_keg'] = $request->file('dok_keg')
                ->storeAs('keg', $filename, 'public');
        }

        $kegiatan = Kegiatan::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dibuat',
            'data'    => $kegiatan
        ]);
    }

    /**
     * UPDATE kegiatan
     */
    public function update(Request $request, $id)
    {
        $kegiatan = Kegiatan::find($id);

        if (!$kegiatan) {
            return response()->json([
                'message' => 'Kegiatan tidak ditemukan'
            ], 404);
        }

        $data = $request->validate([
            'nm_keg'      => 'required|string|max:255',
            'tgl_mulai'   => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'pj_keg'      => 'nullable|string|max:255',
            'panitia'     => 'nullable|string|max:255',
            'dok_keg'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $kegiatan->update($data);

        return response()->json([
            'message' => 'Data kegiatan berhasil diperbarui',
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

        // hapus file
        if ($kegiatan->dok_keg && Storage::disk('public')->exists($kegiatan->dok_keg)) {
            Storage::disk('public')->delete($kegiatan->dok_keg);
        }

        $kegiatan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan berhasil dihapus'
        ]);
    }
}

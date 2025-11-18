<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemasukanBOP;
use Illuminate\Http\Request;
class BopApiController extends Controller
{
    public function index()
    {
        $data = PemasukanBOP::select('tgl', 'nominal', 'ket', 'bkt_nota')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Data berhasil diambil.',
            'data' => $data
        ]);
    }

  
    public function bop_create(Request $request)
    {
        $validated = $request->validate([
            'tgl' => 'required|date',
            'nominal' => 'required|numeric|min:0',
            'ket' => 'required|string',
            'bkt_nota' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Upload file jika ada
        if ($request->hasFile('bkt_nota')) {
            $file = $request->file('bkt_nota');

            $extension = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His') . '_nota.' . $extension;

            $path = $file->storeAs('nota_bop', $filename, 'public');

            $validated['bkt_nota'] = $path;
        }

        $data = PemasukanBOP::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Data berhasil disimpan!',
            'data' => $data
        ], 201);
    }
}

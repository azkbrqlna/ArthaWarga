<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use Illuminate\Http\Request;

class BopController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => PemasukanBOP::select('tgl', 'nominal', 'ket', 'bkt_nota')
                ->latest()
                ->get()
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

         if ($request->hasFile('bkt_nota')) {
            $file = $request->file('bkt_nota');

            // Ambil ekstensi file asli (misal: jpg, png, pdf)
            $extension = $file->getClientOriginalExtension();

            // Buat nama file unik berdasarkan waktu (format: YYYYMMDD_HHMMSS)
            $filename = now()->format('Ymd_His') . '_nota.' . $extension;

            // Simpan file ke storage/app/public/nota_bop/
            $path = $file->storeAs('nota_bop', $filename, 'public');

            $validated['bkt_nota'] = $path;
        }

        PemasukanBOP::create($validated);

        return redirect()->back()->with('success', 'Data berhasil disimpan!');
    }

}

<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard');
    }

    public function bop_create(Request $request)
    {
        $validated = $request->validate([
            'tgl' => ['required', 'date'],
            'nominal' => ['required', 'numeric', 'min:0'],
            'ket' => ['required', 'string'],
            'bkt_nota' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ], [
            'tgl.required' => 'Tanggal wajib diisi.',
            'tgl.date' => 'Format tanggal tidak valid.',
            'nominal.required' => 'Nominal wajib diisi.',
            'nominal.numeric' => 'Nominal harus berupa angka.',
            'nominal.min' => 'Nominal tidak boleh negatif.',
            'ket.required' => 'Keterangan wajib diisi.',
            'bkt_nota.required' => 'Bukti nota wajib diunggah.',
            'bkt_nota.file' => 'Bukti nota harus berupa file.',
            'bkt_nota.mimes' => 'Format file harus jpg, jpeg, png, atau pdf.',
            'bkt_nota.max' => 'Ukuran file maksimal 2MB.',
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

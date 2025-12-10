<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function index()
    {
        $pengeluarans = Pengeluaran::with(['kegiatan', 'pemasukan_bop', 'pemasukan_iuran'])
            ->latest()
            ->get();

        // Hitung saldo
        $totalMasukBop = PemasukanBOP::sum('nominal');
        $totalMasukIuran = PemasukanIuran::sum('nominal');

        // Pengeluaran yang diambil dari BOP
        $totalKeluarBop = Pengeluaran::whereNotNull('masuk_bop_id')->sum('nominal');
        $totalKeluarIuran = Pengeluaran::whereNotNull('masuk_iuran_id')->sum('nominal');

        $sisaBop = $totalMasukBop - $totalKeluarBop;
        $sisaIuran = $totalMasukIuran - $totalKeluarIuran;

        // Data pendukung
        $kegiatans = Kegiatan::select('id', 'nm_keg')->get();

        return Inertia::render('Ringkasan/Pengeluaran', [
            'pengeluarans' => $pengeluarans,
            'kegiatans' => $kegiatans,
            'sisaBop' => $sisaBop,
            'sisaIuran' => $sisaIuran,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tgl' => 'required|date',
            'keg_id' => 'required|exists:keg,id',
            'nominal' => 'required|numeric|min:1',
            'ket' => 'required|string',
            'toko' => 'nullable|string',
        ]);

        $data = [
            'tgl' => $request->tgl,
            'keg_id' => $request->keg_id,
            'nominal' => $request->nominal,
            'ket' => $request->ket,
            'toko' => $request->toko,
        ];

        // Tentukan sumber dana
        if ($request->tipe === 'bop') {
            $data['masuk_bop_id'] = PemasukanBOP::latest()->value('id'); 
        } elseif ($request->tipe === 'iuran') {
            $data['masuk_iuran_id'] = PemasukanIuran::latest()->value('id');
        }

        Pengeluaran::create($data);

        return back()->with('success', 'Pengeluaran berhasil ditambahkan.');
    }

    public function destroy($id)
    {
        $del = Pengeluaran::findOrFail($id);
        $del->delete();

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }
}

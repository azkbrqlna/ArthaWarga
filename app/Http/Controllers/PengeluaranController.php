<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function index()
    {
        $pengeluarans = Pengeluaran::with('kegiatan')->latest()->get();

        $jumlahApproved = PemasukanIuran::where('masuk_iuran.status', 'approved')
            ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->sum('pengumuman.jumlah');

        $totalIuranManual = PemasukanIuran::where('status', 'approved')
            ->whereNull('pengumuman_id')
            ->sum('nominal');

        $totalIuran = $totalIuranManual + $jumlahApproved;

        $saldoBop = PemasukanBOP::sum('nominal') - Pengeluaran::where('tipe', 'bop')->sum('nominal');
        $saldoIuran = $totalIuran - Pengeluaran::where('tipe', 'iuran')->sum('nominal');

        $kegiatans = Kegiatan::select('id', 'nm_keg')->get();

        $totalBop = PemasukanBOP::sum('nominal');
        $totalPengeluaranBop = Pengeluaran::where('tipe', 'bop')->sum('nominal');
        $totalPengeluaranIuran = Pengeluaran::where('tipe', 'iuran')->sum('nominal');

        $sisaBop = $totalBop - $totalPengeluaranBop;
        $sisaIuran = $totalIuran - $totalPengeluaranIuran;

        return Inertia::render('Ringkasan/Pengeluaran', [
            'pengeluarans' => $pengeluarans,
            'saldo' => [
                'bop' => $saldoBop,
                'iuran' => $saldoIuran,
            ],
            'kegiatans' => $kegiatans,
            'sisaBop' => $sisaBop,
            'sisaIuran' => $sisaIuran,
        ]);
    }


    public function pengeluaran(Request $request)
    {
        $validated = $request->validate([
            'tgl' => 'required|date',
            'keg_id' => 'required|exists:keg,id',
            'nominal' => 'required|numeric|min:0',
            'ket' => 'required|string',
            'tipe' => 'required|in:bop,iuran',
            'toko'  => 'nullable|string|max:255',
            'bkt_nota' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('bkt_nota')) {
            $file       = $request->file('bkt_nota');
            $extension  = $file->getClientOriginalExtension();
            $filename   = now()->format('Ymd_His') . '_nota.' . $extension;
            $path       = $file->storeAs('nota_pengeluaran', $filename, 'public');

            $validated['bkt_nota'] = $path;
        }

        if ($validated['tipe'] === 'bop') {
            $totalMasuk = PemasukanBOP::sum('nominal');
        } else {
            $jumlahApproved = PemasukanIuran::where('masuk_iuran.status', 'approved')
                ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
                ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
                ->sum('pengumuman.jumlah');

            $totalIuranManual = PemasukanIuran::where('status', 'approved')
                ->whereNull('pengumuman_id')
                ->sum('nominal');

            $totalMasuk = $totalIuranManual + $jumlahApproved;
        }

        $totalKeluar = Pengeluaran::where('tipe', $validated['tipe'])->sum('nominal');
        $saldo = $totalMasuk - $totalKeluar;

        if ($saldo < $validated['nominal']) {
            return back()->withErrors([
                'nominal' => 'Saldo ' . strtoupper($validated['tipe']) . ' tidak mencukupi.',
            ]);
        }

        Pengeluaran::create($validated);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Pengeluaran dari ' . strtoupper($validated['tipe']) . ' berhasil disimpan.');
    }
}

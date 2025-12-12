<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use App\Models\PemasukanBOP;
use App\Models\PemasukanIuran;
use App\Models\Kegiatan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage; // Tambahkan ini
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    public function index()
    {
        
        $pengeluarans = Pengeluaran::with(['kegiatan', 'pemasukan_bop', 'pemasukan_iuran'])
            ->latest()
            ->get()
            ->map(function ($pengeluaran) {
                // Tambahkan URL lengkap untuk ditampilkan di frontend
                $pengeluaran->bkt_nota_url = $pengeluaran->bkt_nota 
                    ? asset('storage/' . $pengeluaran->bkt_nota) 
                    : null;
                return $pengeluaran;
            });

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

        $listPenerima = User::whereIn('role_id', [2, 3])
            ->orderBy('nm_lengkap', 'asc')
            ->get(['id', 'nm_lengkap']);

        return Inertia::render('Ringkasan/Pengeluaran', [
            'pengeluarans' => $pengeluarans,
            'kegiatans' => $kegiatans,
            'listPenerima' => $listPenerima,
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
            'penerima' => 'required|string',
            'tipe' => 'required|in:bop,iuran',
            'bkt_nota' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $data = [
            'tgl' => $request->tgl,
            'keg_id' => $request->keg_id,
            'nominal' => $request->nominal,
            'ket' => $request->ket,
            'toko' => $request->toko,
            'penerima' => $request->penerima,
        ];

        // LOGIKA PENYIMPANAN FILE
        if ($request->hasFile('bkt_nota')) {
            // Simpan ke folder 'storage/app/public/nota'
            $path = $request->file('bkt_nota')->store('nota', 'public');
            $data['bkt_nota'] = $path;
        }

        // Tentukan sumber dana
        if ($request->tipe === 'bop') {
            $data['masuk_bop_id'] = PemasukanBOP::latest()->value('id'); 
        } elseif ($request->tipe === 'iuran') {
            $data['masuk_iuran_id'] = PemasukanIuran::latest()->value('id');
        }

        Pengeluaran::create($data);

        return back()->with('success', 'Pengeluaran berhasil ditambahkan.');
    }

}
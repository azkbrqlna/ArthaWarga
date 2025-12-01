<?php

namespace App\Http\Controllers;

use App\Models\KategoriIuran;
use App\Models\PemasukanIuran;
use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengumumanController extends Controller
{
    public function pengumuman()
    {
        $kategori_iuran = KategoriIuran::whereIn('id', [1, 2])->get();

        return Inertia::render('Ringkasan/Pengumuman', [
            'kategori_iuran' => $kategori_iuran
        ]);
    }

    public function pengumuman_create(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string',
            'ket' => 'required|string',
            'jumlah' => 'required|integer',
            'kat_iuran_id' => 'required|exists:kat_iuran,id',
        ]);

        $pengumuman = Pengumuman::create([
            'judul' => $validated['judul'],
            'ket' => $validated['ket'],
            'jumlah' => $validated['jumlah'],
            'kat_iuran_id' => $validated['kat_iuran_id'],
        ]);

        $users = User::all();

        foreach ($users as $user) {
            PemasukanIuran::create([
                'usr_id' => $user->id,
                'kat_iuran_id' => $validated['kat_iuran_id'],
                'pengumuman_id' => $pengumuman->id,
                'tgl' => now(),
                'status' => 'tagihan',
            ]);
        }

        return back()->with('success', 'Pengumuman berhasil dibuat dan tagihan dikirim ke semua warga.');
    }

    public function approval()
    {
        $iurans = PemasukanIuran::with(['pengumuman.kat_iuran', 'user'])
            ->whereIn('status', ['pending', 'approved'])
            ->whereIn('kat_iuran_id', [1, 2])
            ->orderByDesc('tgl')
            ->paginate(10);

        // FIX nama tabel dari "masuk_iuran" → "pemasukan_iurans"
        $jumlahTagihan = PemasukanIuran::whereIn('pemasukan_iurans.status', ['pending', 'tagihan'])
            ->whereIn('pemasukan_iurans.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'pemasukan_iurans.pengumuman_id', '=', 'pengumuman.id')
            ->sum('pengumuman.jumlah');

        $jumlahApproved = PemasukanIuran::where('pemasukan_iurans.status', 'approved')
            ->whereIn('pemasukan_iurans.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'pemasukan_iurans.pengumuman_id', '=', 'pengumuman.id')
            ->sum('pengumuman.jumlah');


        // dd($iurans->first()->toArray());
        // dd($jumlahTagihan, $jumlahApproved);


        return Inertia::render('Ringkasan/Approval', [
            'iurans' => $iurans,
            'jumlahTagihan' => $jumlahTagihan,
            'jumlahApproved' => $jumlahApproved,
        ]);
    }

    public function semua_iuran(Request $request)
    {
        $filter = $request->query('filter', 'all');

        $query = PemasukanIuran::with(['user', 'pengumuman.kat_iuran']);

        if ($filter !== 'all') {
            $query->where('status', $filter);
        }

        $query->whereIn('kat_iuran_id', [1, 2])
              ->orderBy('tgl', 'DESC');

        $iurans = $query->paginate(10);

        $totalWarga = User::count();
        $jumlahSudahBayar = PemasukanIuran::where('status', 'approved')->count();
        $jumlahBelumBayar = PemasukanIuran::where('status', 'tagihan')->count();

        return Inertia::render('Ringkasan/SemuaIuran', [
            'iurans' => $iurans,
            'filter' => $filter,
            'summary' => [
                'totalWarga' => $totalWarga,
                'jumlahSudahBayar' => $jumlahSudahBayar,
                'jumlahBelumBayar' => $jumlahBelumBayar,
            ]
        ]);
    }

    public function approval_patch(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,tagihan'
        ]);

        $iuran = PemasukanIuran::findOrFail($id);
        $iuran->status = $request->status;
        $iuran->save();

        return back()->with('success', 'Status berhasil diperbarui.');
    }
}

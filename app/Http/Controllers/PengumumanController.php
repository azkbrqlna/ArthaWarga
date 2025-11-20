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

        // $users = User::whereNotIn('role_id', [1, 2, 3, 4])->get();
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
        $iurans = PemasukanIuran::with(['pengumuman.kat_iuran'])
            ->whereIn('status', ['pending', 'approved'])
            ->whereIn('kat_iuran_id', [1, 2])
            ->orderByDesc('tgl')
            ->paginate(10);

        $jumlahTagihan = PemasukanIuran::whereIn('masuk_iuran.status', ['pending', 'tagihan'])
            ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->sum('pengumuman.jumlah');


       $jumlahApproved = PemasukanIuran::where('masuk_iuran.status', 'approved')
            ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->sum('pengumuman.jumlah');


        // dd($iurans);
        // dd($jumlahTagihan, $jumlahApproved);


        return Inertia::render('Ringkasan/Approval', [
            'iurans' => $iurans,
            'jumlahTagihan' => $jumlahTagihan,
            'jumlahApproved' => $jumlahApproved,
        ]);
    }




    public function approval_patch(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,tagihan'
        ]);

        $iuran = PemasukanIuran::findOrFail($id);

        if ($request->status === 'approved') {
            $iuran->status = 'approved';
        } else {
            $iuran->status = 'tagihan';
        }

        $iuran->save();

        return back()->with('success', 'Status berhasil diperbarui.');
    }

}

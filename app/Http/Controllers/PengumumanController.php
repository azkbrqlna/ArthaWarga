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

    // 1. Simpan pengumuman
    $pengumuman = Pengumuman::create([
        'judul' => $validated['judul'],
        'ket' => $validated['ket'],
        'jumlah' => $validated['jumlah'],
        'kat_iuran_id' => $validated['kat_iuran_id'],
    ]);

   
    $users = User::whereNotIn('role_id', [1, 2, 3, 4])->get();

        foreach ($users as $user) {
            PemasukanIuran::create([
                'usr_id' => $user->id,
                'kat_iuran_id' => $validated['kat_iuran_id'],
                'pengumuman_id' => $pengumuman->id,
                'tgl' => now(), 
                'nominal' => $validated['jumlah'],
                'status' => 'tagihan',
            ]);
        }

    return back()->with('success', 'Pengumuman berhasil dibuat dan tagihan dikirim ke semua warga (kecuali Admin/Sekretaris/Bendahara/SuperAdmin).');
}


    public function approval()
    {
        // ambil semua iuran untuk admin review (tidak dibatasi bulan)
        $iurans = PemasukanIuran::with(['pengumuman.kat_iuran', 'user'])
            ->whereIn('status', ['pending', 'approved'])
            ->whereIn('kat_iuran_id', [1, 2])
            ->orderByDesc('tgl')
            ->paginate(10);

        // filter berdasarkan bulan saat ini (hanya untuk ringkasan angka)
        $year  = now()->year;
        $month = now()->month;

        // jumlah tagihan: hanya pengumuman yang dibuat pada bulan ini
        $jumlahTagihan = PemasukanIuran::whereIn('masuk_iuran.status', ['pending', 'tagihan'])
            ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->whereYear('pengumuman.created_at', $year)
            ->whereMonth('pengumuman.created_at', $month)
            ->sum('pengumuman.jumlah');

        // jumlah approved: yang dibayar (approved) di bulan ini
        $jumlahApproved = PemasukanIuran::where('masuk_iuran.status', 'approved')
            ->whereIn('masuk_iuran.kat_iuran_id', [1, 2])
            ->join('pengumuman', 'masuk_iuran.pengumuman_id', '=', 'pengumuman.id')
            ->whereYear('pengumuman.created_at', $year)
            ->whereMonth('pengumuman.created_at', $month)
            ->sum('pengumuman.jumlah');


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

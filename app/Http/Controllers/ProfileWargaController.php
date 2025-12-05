<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\User; // Pastikan Model User di-import

class ProfileWargaController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Anda harus login untuk mengakses profil.');
        }

        $maskedPassword = '********';

        return Inertia::render('Profil/Profil', [
            'user' => [
                'id'             => $user->id,
                'role_id'        => $user->role_id,
                'email'          => $user->email,
                'no_kk'          => $user->no_kk,
                'password'       => $maskedPassword,
                'nm_lengkap'     => $user->nm_lengkap,
                'foto_profil'    => $user->foto_profil,
                'no_hp'          => $user->no_hp,
                'rt'             => $user->rt,
                'rw'             => $user->rw,
                'kode_pos'       => $user->kode_pos,
                'alamat'         => $user->alamat,
                'status'         => $user->status, // Tambahan status agar tidak error di JSX
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Validasi
        $validated = $request->validate([
            'nm_lengkap' => 'required|string|max:255',
            'email'      => 'required|email|unique:usr,email,'.$user->id, // Ignore email sendiri
            'no_hp'      => 'nullable|string',
            'no_kk'      => 'nullable|string',
            'alamat'     => 'nullable|string',
            'rt'         => 'nullable|string',
            'rw'         => 'nullable|string',
            'kode_pos'   => 'nullable|string',
            'password'   => 'nullable|string|min:6',
        ]);

        // Logic Update Password
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // Hapus key password jika kosong agar tidak ke-reset
        }

        // Sekarang method update() tidak akan digaris merah lagi
        $user->update($validated);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui!');
    }
}
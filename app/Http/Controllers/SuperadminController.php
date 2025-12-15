<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Kota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SuperadminController extends Controller
{
    public function users(Request $request)
    {
        // Mulai Query
        $query = User::with(['role', 'kota', 'kecamatan', 'kelurahan'])
                ->where('role_id', '!=', 1);

        // 1. Logika Pencarian (Search)
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('nm_lengkap', 'like', "%{$search}%")
                  ->orWhere('no_kk', 'like', "%{$search}%");
            });
        }

        // 2. Logika Filter Role
        if ($request->filled('role') && $request->input('role') !== 'all') {
            $roleName = $request->input('role');
            $query->whereHas('role', function($q) use ($roleName) {
                $q->where('nm_role', $roleName);
            });
        }

        // Eksekusi Query dengan Pagination
        // withQueryString() penting agar filter tidak hilang saat pindah halaman
        $users = $query->latest()
                ->paginate(10)
                ->withQueryString();
        
        $roles = Role::all();

        return Inertia::render('Manajemen/ManajemenData', [
            'users' => $users,
            'roles' => $roles,
            // Kirim balik filter agar input tetap terisi setelah refresh
            'filters' => $request->only(['search', 'role']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    public function createUser()
    {
        $roles = Role::where('id', '!=', 1)->get();
        // LOAD: Wilayah juga cukup sampai Kelurahan
        $kotas = Kota::with('kecamatans.kelurahans')->get();

        return Inertia::render('Manajemen/TambahData', [
            'roles' => $roles,
            'wilayah' => $kotas
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'nm_lengkap' => 'required|string',
            'no_kk' => 'required|digits:16|unique:usr,no_kk',
            'email' => 'required|email|unique:usr,email',
            'password' => 'required|min:6',
            'no_hp' => 'nullable',
            'role_id' => 'required',
            'status' => 'required',
            'alamat' => 'required|string',
            
            // Validasi String Manual
            'kode_pos' => 'required',
            'rw' => 'required',
            'rt' => 'required',

            // Validasi ID Wilayah Database
            'kota_id' => 'required',
            'kecamatan_id' => 'required',
            'kelurahan_id' => 'required',
        ]);

        User::create([
            'nm_lengkap' => $request->nm_lengkap,
            'email' => $request->email,
            'no_kk' => $request->no_kk,
            'password' => Hash::make($request->password),
            'no_hp' => $request->no_hp,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'alamat' => $request->alamat,
            
            // Simpan String Manual
            'kode_pos' => $request->kode_pos,
            'rw' => $request->rw,
            'rt' => $request->rt,

            // Simpan ID Wilayah
            'kota_id' => $request->kota_id,
            'kecamatan_id' => $request->kecamatan_id,
            'kelurahan_id' => $request->kelurahan_id,
        ]);

        return redirect()->back();
    }

    public function editUser($id)
    {
        // LOAD: Cukup sampai Kelurahan
        $user = User::with(['role', 'kota', 'kecamatan', 'kelurahan'])->findOrFail($id);
        
        $roles = Role::where('id', '!=', 1)->get();
        $kotas = Kota::with('kecamatans.kelurahans')->get();

        return Inertia::render('Manajemen/EditData', [
            'user' => $user,
            'roles' => $roles,
            'wilayah' => $kotas 
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nm_lengkap' => 'required|string',
            'email' => 'required|email|unique:usr,email,' . $id . ',id',
            'no_kk' => 'required|digits:16|unique:usr,no_kk,' . $id . ',id',
            'no_hp' => 'required',
            'role_id' => 'required',
            'status' => 'required',
            'alamat' => 'required|string',
            
            'kode_pos' => 'required',
            'rw' => 'required',
            'rt' => 'required',
            'kota_id' => 'required',
            'kecamatan_id' => 'required',
            'kelurahan_id' => 'required',
        ]);

        $data = [
            'nm_lengkap' => $request->nm_lengkap,
            'email' => $request->email,
            'no_kk' => $request->no_kk,
            'no_hp' => $request->no_hp,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'alamat' => $request->alamat,
            
            // Update String Manual
            'kode_pos' => $request->kode_pos,
            'rw' => $request->rw,
            'rt' => $request->rt,

            // Update ID Wilayah
            'kota_id' => $request->kota_id,
            'kecamatan_id' => $request->kecamatan_id,
            'kelurahan_id' => $request->kelurahan_id,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'Data user berhasil diperbarui');
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->role_id == 1) {
            return back()->with('error', 'Akun tidak bisa dihapus');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus');
    }
}
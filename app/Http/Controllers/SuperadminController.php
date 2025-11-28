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
    public function users()
    {
        // Update: Load semua relasi wilayah secara langsung
        $users = User::with(['role', 'kota', 'kecamatan', 'kelurahan', 'rw', 'rt'])
                ->where('role_id', '!=', 1)
                ->latest()
                ->paginate(10);
        
        $roles = Role::all();

        return Inertia::render('ManajemenData', [
            'users' => $users,
            'roles' => $roles,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    public function createUser()
    {
        $roles = Role::where('id', '!=', 1)->get();
        // Load hierarki wilayah lengkap untuk dropdown
        $kotas = Kota::with('kecamatans.kelurahans.rws.rts')->get();

        return Inertia::render('TambahData', [
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
            'kode_pos' => 'nullable',
            // Validasi ID Wilayah
            'kota_id' => 'required',
            'kecamatan_id' => 'required',
            'kelurahan_id' => 'required',
            'rw_id' => 'required',
            'rt_id' => 'required',
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
            'kode_pos' => $request->kode_pos,
            // Simpan 5 ID Wilayah
            'kota_id' => $request->kota_id,
            'kecamatan_id' => $request->kecamatan_id,
            'kelurahan_id' => $request->kelurahan_id,
            'rw_id' => $request->rw_id,
            'rt_id' => $request->rt_id,
        ]);

        return redirect()->route('superadmin.users')->with('success', 'User berhasil ditambahkan');
    }

    public function editUser($id)
    {
        // Load user dengan semua relasi wilayahnya
        $user = User::with(['role', 'kota', 'kecamatan', 'kelurahan', 'rw', 'rt'])->findOrFail($id);
        
        $roles = Role::where('id', '!=', 1)->get();
        $kotas = Kota::with('kecamatans.kelurahans.rws.rts')->get();

        return Inertia::render('EditData', [
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
            // Validasi Wilayah
            'kota_id' => 'required',
            'kecamatan_id' => 'required',
            'kelurahan_id' => 'required',
            'rw_id' => 'required',
            'rt_id' => 'required',
        ]);

        $data = [
            'nm_lengkap' => $request->nm_lengkap,
            'email' => $request->email,
            'no_kk' => $request->no_kk,
            'no_hp' => $request->no_hp,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'alamat' => $request->alamat,
            'kode_pos' => $request->kode_pos,
            // Update Wilayah
            'kota_id' => $request->kota_id,
            'kecamatan_id' => $request->kecamatan_id,
            'kelurahan_id' => $request->kelurahan_id,
            'rw_id' => $request->rw_id,
            'rt_id' => $request->rt_id,
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
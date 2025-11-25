<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SuperadminController extends Controller
{
    public function users()
    {
        $users = User::with('role')->paginate(10);
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
        $roles = Role::all();

        return Inertia::render('TambahData', [
            'roles' => $roles
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
            'rt' => 'required',
            'rw' => 'nullable',
            'kode_pos' => 'nullable'
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
            'rt' => $request->rt,
            'rw' => $request->rw,
            'kode_pos' => $request->kode_pos
        ]);

        return redirect()->route('superadmin.users')->with('success', 'User berhasil ditambahkan');
    }

    public function editUser($id)
    {
        $user = User::with('role')->findOrFail($id);
        $roles = Role::all();

        return Inertia::render('EditData', [
            'user' => $user,
            'roles' => $roles,
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
            'rt' => 'required',
            'rw' => 'required',
            'kode_pos' => 'required'
        ]);

        $data = [
            'nm_lengkap' => $request->nm_lengkap,
            'email' => $request->email,
            'no_kk' => $request->no_kk,
            'no_hp' => $request->no_hp,
            'role_id' => $request->role_id,
            'status' => $request->status,
            'alamat' => $request->alamat,
            'rt' => $request->rt,
            'rw' => $request->rw,
            'kode_pos' => $request->kode_pos
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('superadmin.users')->with('success', 'Data user berhasil diperbarui');
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

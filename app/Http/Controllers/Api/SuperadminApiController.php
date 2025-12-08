<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SuperadminApiController extends Controller
{
    /**
     * GET – daftar user + role
     */
    public function index()
    {
        $users = User::with('role')->paginate(10);
        $roles = Role::all();

        return response()->json([
            'success' => true,
            'users' => $users,
            'roles' => $roles
        ]);
    }

    /**
     * GET – detail user
     */
    public function show($id)
    {
        $user = User::with('role')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * POST – tambah user baru
     */
    public function store(Request $request)
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

        $user = User::create([
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

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'user' => $user
        ], 201);
    }

    /**
     * PUT/PATCH – update user
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

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

        // update password jika diisi
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diperbarui',
            'user' => $user
        ]);
    }

    /**
     * DELETE – hapus user
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan'
            ], 404);
        }

        if ($user->role_id == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Superadmin tidak bisa dihapus'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus'
        ]);
    }
}

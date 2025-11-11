<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileWargaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       $userId = Auth::id();
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Anda harus login untuk mengakses profil.');
        }

        // Password disensor
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
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, $id)
{
    $user = Auth::user();

    $validated = $request->validate([
        'nm_lengkap' => 'required|string|max:255',
        'password' => 'nullable|string|confirmed',
        'email' => 'required|email',
        'no_hp' => 'nullable|string',
        'no_kk' => 'nullable|string',
        'rt' => 'nullable|string',
        'rw' => 'nullable|string',
        'kode_pos' => 'nullable|string',
    ]);

    if (empty($validated['password'])) {
        unset($validated['password']);
    }
    
    $user->update($validated);

    return redirect()->back()->with('success', 'Profil berhasil diperbarui!');
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
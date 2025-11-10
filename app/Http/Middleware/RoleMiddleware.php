<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Jika user belum login
        if (!$user) {
            return redirect('/');
        }

      

        // Definisi izin akses
        $role = $user->role_id; // pastikan kolom ini ada di tabel users

        $access = [
            1 => ['dashboard'], // superadmin
            2 => ['*'], // ketua rt
            3 => ['dashboard', 'pemasukan.index', 'pengeluaran', 'rincian.show'],
            4 => ['dashboard', 'kegiatan.create', 'rincian.show'],  
            5 => ['dashboard','rincian.show'], 
        ];

        $routeName = $request->route()->getName();

        if (!in_array('*', $access[$role]) && !in_array($routeName, $access[$role])) {
            return redirect('/dashboard');
        }

        return $next($request);
    }
}

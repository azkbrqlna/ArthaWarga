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
            3 => ['dashboard', 'pemasukan.index', 'pengeluaran', 'rincian.show', "pengumuman", 'bop.create', 'iuran.create', 'kat_iuran.create', 'kat_iuran.delete', 'pengumuman.create', 'pengeluaran.store'], // bendahara
            4 => ['dashboard', 'kegiatan.create','kegiatan.store', 'rincian.show', "pengumuman"],   //sekretaris
            5 => ['dashboard','rincian.show'], // warga
        ];

        $routeName = $request->route()->getName();

        if (!in_array('*', $access[$role]) && !in_array($routeName, $access[$role])) {
            return redirect('/dashboard');
        }

        return $next($request);
    }
}

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

        if (!$user) {
            return redirect('/');
        }

        $role = $user->role_id; 

        $kategoriIuranRoutes = [
            'kat_iuran.index',   
            'kat_iuran.store',   
            'kat_iuran.show',    
            'kat_iuran.update',  
            'kat_iuran.destroy', 
        ];

        $access = [
            1 => array_merge(
                ['dashboard', 'profil.index', 'profil.update', 'superadmin.users', 'superadmin.createUser', 'superadmin.storeUser', 'superadmin.editUser', 'superadmin.updateUser', 'superadmin.deleteUser'], 
                $kategoriIuranRoutes 
            ), 
            2 => array_merge([ 
                'dashboard',
                'pemasukan.index',
                'kegiatan.create',
                'kegiatan.store',
                'kegiatan.index',
                'bop.create',
                'iuran.create',
                'pengumuman',
                'pengumuman.create',
                'pengeluaran',
                'pengeluaran.store',
                'rincian.show',
                'profil.index',
                'profil.update',
                'approval',
                'approval.patch',
                'tagihan.create',
                'tagihan.store',
                'tagihan.upload',
                'tagihan.generate',
                'tagihan.monitoring',
                'tagihan.approve',
                'tagihan.decline',
                'tagihan.warga.index',
                'tagihan.warga.show',
                'tagihan.bayar',
            ], $kategoriIuranRoutes), 
            
            3 => array_merge([ // Bendahara
                'dashboard', 
                'pemasukan.index', 
                'pengeluaran', 
                'rincian.show', 
                'pengumuman',
                'profil.index', 
                'profil.update', 
                'bop.create', 
                'iuran.create', 
                'pengumuman.create', 
                'pengeluaran.store',
                'tagihan.create',
                'tagihan.store',
                'tagihan.upload',
                'tagihan.generate',
                'tagihan.monitoring',
                'tagihan.approve',
                'tagihan.decline',
                'tagihan.warga.index',
                'tagihan.warga.show',
                'tagihan.bayar',
            ], $kategoriIuranRoutes), 
            
            4 => [ // Sekretaris
                'dashboard', 
                'kegiatan.create',
                'kegiatan.store',
                'kegiatan.index', 
                'rincian.show', 
                'pengumuman',
                'profil.index', 
                'profil.update',
                'tagihan.create',
                'tagihan.store',
                'tagihan.upload',
                'tagihan.generate',
                'tagihan.monitoring',
                'tagihan.approve',
                'tagihan.decline',
                'tagihan.warga.index',
                'tagihan.warga.show',
                'tagihan.bayar',
            ], 
            5 => [ // Warga
                'dashboard',
                'rincian.show', 
                'profil.index', 
                'profil.update',
                'masuk-iuran.index', 
                'masuk-iuran.show', 
                'masuk-iuran.store',
                'tagihan.upload',
                'tagihan.warga.index',
                'tagihan.warga.show',
                'tagihan.bayar',
            ], 
        ];

        $routeName = $request->route()->getName();

        if (!isset($access[$role]) || !in_array($routeName, $access[$role])) {
            return redirect('/dashboard');
        }

        return $next($request);
    }
}
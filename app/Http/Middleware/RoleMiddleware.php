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

        $kategoriIuranRoutes = [
            'kat_iuran.index',    
            'kat_iuran.store',     
            'kat_iuran.update',   
            'kat_iuran.destroy',
            'kategori.index',   
        ];

        $role = $user->role_id; 

        $access = [
            // ID 1: Superadmin
            1 => array_merge(
                ['dashboard', 'profil.index', 'profil.update', 'superadmin.users', 'superadmin.createUser', 'superadmin.storeUser', 'superadmin.editUser', 'superadmin.updateUser', 'superadmin.deleteUser'], 
                $kategoriIuranRoutes
            ), 
            
            // ID 2: Ketua RT
            2 => array_merge([
                'dashboard',
                'pemasukan.index',
                'bop.create',
                'iuran.create',
                'pengeluaran',
                'pengeluaran.store',
                'rincian.show',
                'profil.index',
                'profil.update',
                'kegiatan.create',
                'kegiatan.store',
                'kegiatan.index',
                'kegiatan.edit',    
                'kegiatan.update', 
                'kegiatan.destroy',
                'approval',
                'approval.patch',
                'tagihan.create',
                'tagihan.store',
                'tagihan.generate',
                'tagihan.approval',
                'tagihan.approve',
                'tagihan.decline',
                'tagihan.rt.index',
                'tagihan.edit',
                'tagihan.update',
                'tagihan.destroy',
                'profil.updatePhoto',
                'profil.deletePhoto',
                'spj.download',
            ], $kategoriIuranRoutes), // Ketua RT
            
            // ID 3: Bendahara
            3 => array_merge([ 
                'dashboard', 
                'pemasukan.index', 
                'pengeluaran', 
                'rincian.show', 
                'profil.index', 
                'profil.update', 
                'bop.create', 
                'iuran.create', 
                'pengumuman.create', 
                'pengeluaran.store',
                'tagihan.create',
                'tagihan.store',
                'tagihan.generate',
                'tagihan.approval',
                'tagihan.approve',
                'tagihan.decline',
                'tagihan.rt.index',
                'tagihan.edit',
                'tagihan.update',
                'tagihan.destroy',
                'profil.updatePhoto',
                'profil.deletePhoto',
                'spj.download',
            ], $kategoriIuranRoutes), 
            
            // ID 4: Sekretaris
            4 => [ 
                'dashboard', 
                'kegiatan.create',
                'kegiatan.store',
                'kegiatan.index', 
                'rincian.show', 
                'profil.index', 
                'profil.update',
                'kegiatan.create',
                'kegiatan.store',
                'kegiatan.index',
                'kegiatan.edit',    
                'kegiatan.update', 
                'kegiatan.destroy',
                'tagihan.create',
                'tagihan.store',
                'tagihan.generate',
                'tagihan.approval',
                'tagihan.approve',
                'tagihan.decline',
                'tagihan.rt.index',
                'tagihan.edit',
                'tagihan.update',
                'tagihan.destroy',
                'profil.updatePhoto',
                'profil.deletePhoto',
                'spj.download',
            ], 
            
            // ID 5: Warga
            5 => [ 
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
                'profil.updatePhoto',
                'profil.deletePhoto',
            ], 
        ];

        $routeName = $request->route()->getName();

        if (!isset($access[$role]) || !in_array($routeName, $access[$role])) {
            return redirect('/dashboard');
        }

        return $next($request);
    }
}
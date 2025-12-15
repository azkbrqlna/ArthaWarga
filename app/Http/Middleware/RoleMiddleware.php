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

        $routeName = $request->route()->getName();
        $role = $user->role_id;

        // ===============================
        // ROUTE BERSAMA (Kategori Iuran)
        // ===============================
        $kategoriIuranRoutes = [
            'kat_iuran.index',
            'kat_iuran.store',
            'kat_iuran.update',
            'kat_iuran.destroy',
            'kategori.index',
        ];

        // ===============================
        // KETUA RT (DAN SEKRETARIS)
        // ===============================
        $ketuaRtAccess = array_merge([
            'dashboard',
            'pemasukan.index',
            'bop.create',
            'iuran.create',
            'pengeluaran',
            'pengeluaran.store',
            'rincian.show',
            'profil.index',
            'profil.update',
            'profil.updatePhoto',
            'profil.deletePhoto',

            // KEGIATAN
            'kegiatan.create',
            'kegiatan.store',
            'kegiatan.index',
            'kegiatan.show',
            'kegiatan.edit',
            'kegiatan.update',
            'kegiatan.destroy',
            'kegiatan.generateSpjPdf',

            // TAGIHAN
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

            // APPROVAL & SPJ
            'approval',
            'approval.patch',
            'spj.download',
        ], $kategoriIuranRoutes);

        // ===============================
        // AKSES BERDASARKAN ROLE
        // ===============================
        $access = [

            // 1️⃣ SUPERADMIN
            1 => array_merge([
                'dashboard',
                'profil.index',
                'profil.update',
                'profil.updatePhoto',
                'profil.deletePhoto',

                // MANAJEMEN USER
                'superadmin.users',
                'superadmin.createUser',
                'superadmin.storeUser',
                'superadmin.editUser',
                'superadmin.updateUser',
                'superadmin.deleteUser',

                'kegiatan.show',
            ], $kategoriIuranRoutes),

            // 2️⃣ KETUA RT
            2 => $ketuaRtAccess,

            // 3️⃣ BENDAHARA
            3 => array_merge([
                'dashboard',
                'pemasukan.index',
                'pengeluaran',
                'pengeluaran.store',
                'rincian.show',
                'profil.index',
                'profil.update',
                'profil.updatePhoto',
                'profil.deletePhoto',

                'bop.create',
                'iuran.create',

                'kegiatan.index',
                'kegiatan.show',
                'kegiatan.generateSpjPdf',

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

                'spj.download',
            ], $kategoriIuranRoutes),

            // 4️⃣ SEKRETARIS (SAMA DENGAN KETUA RT)
            4 => $ketuaRtAccess,

            // 5️⃣ WARGA
            5 => [
                'dashboard',
                'rincian.show',
                'profil.index',
                'profil.update',
                'profil.updatePhoto',
                'profil.deletePhoto',
                'tagihan.upload',
                'tagihan.warga.index',
                'tagihan.warga.show',
                'tagihan.bayar',
            ],
        ];

        // ===============================
        // VALIDASI AKSES
        // ===============================
        if (!isset($access[$role]) || !in_array($routeName, $access[$role])) {
            return redirect('/dashboard');
        }
 


        return $next($request);
    }
}

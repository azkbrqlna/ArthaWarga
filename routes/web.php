<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DownloaderController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\MasukIuranController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\ProfileWargaController;
use App\Http\Controllers\ApiDocsController;
use App\Http\Controllers\SpjController;
use App\Http\Controllers\SuperadminController;
use App\Http\Controllers\KategoriIuranController; 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- API Documentation Password Protection ---

Route::get('/docs/password', [ApiDocsController::class, 'showPasswordForm'])->name('docs.password.form');
Route::post('/docs/password', [ApiDocsController::class, 'processPassword'])->name('docs.password.process');

// --- Otentikasi Publik ---

Route::get('/', fn() => Inertia::render('Welcome'));
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// --- Rute yang Memerlukan Akses Role (Umumnya Warga/Admin) ---

Route::middleware(['role.access'])->group(function () {
    
    // DASHBOARD & RINCIAN
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/rincian/{id}', [DashboardController::class, 'rincian'])->name('rincian.show');
    
    // IURAN & PEMASUKAN (Admin/Bendahara)
    Route::get('/dashboard/pemasukan', [IuranController::class, 'pemasukan'])->name('pemasukan.index');
    Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
    Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');

    // KATEGORI IURAN
    Route::get('/kat_iuran', [KategoriIuranController::class, 'index'])->name('kat_iuran.index');          
    Route::post('/kat_iuran', [KategoriIuranController::class, 'store'])->name('kat_iuran.store');         
    Route::get('/kat_iuran/{id}', [KategoriIuranController::class, 'show'])->name('kat_iuran.show');       
    Route::put('/kat_iuran/{id}', [KategoriIuranController::class, 'update'])->name('kat_iuran.update');   
    Route::delete('/kat_iuran/{id}', [KategoriIuranController::class, 'destroy'])->name('kat_iuran.destroy'); 

    // KEGIATAN
    Route::get('/dashboard/kegiatan', [KegiatanController::class, 'create'])->name('kegiatan.create');
    Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');
    Route::get('/kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index'); 

    // PENGUMUMAN & PERSETUJUAN (Approval)
    Route::get('/dashboard/pengumuman', [PengumumanController::class, 'pengumuman'])->name('pengumuman');
    Route::post('/pengumuman/create', [PengumumanController::class, 'pengumuman_create'])->name('pengumuman.create');
    Route::get('/approval', [PengumumanController::class, 'approval'])->name('approval');
    Route::patch('/approval/{id}', [PengumumanController::class, 'approval_patch'])->name('approval.patch'); 
    
    // PENGELUARAN & SPJ
    Route::get('/dashboard/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran');
    Route::post('/pengeluaran', [PengeluaranController::class, 'store'])->name('pengeluaran.store');
    Route::get('/spj/download/{id}', [SpjController::class, 'download'])->name('spj.download');
    
    // PROFIL WARGA
    Route::get('/profil', [ProfileWargaController::class, 'index'])->name('profil.index');
    Route::put('/profil/update/{id}', [ProfileWargaController::class, 'update'])->name('profil.update');
    
    // PEMBAYARAN IURAN WARGA (Upload Bukti Bayar)
    Route::get('/masuk-iuran', [MasukIuranController::class, 'index'])->name('masuk-iuran.index');
    Route::get('/masuk-iuran/{id}', [MasukIuranController::class, 'show'])->name('masuk-iuran.show');
    Route::post('/masuk-iuran/upload', [MasukIuranController::class, 'store'])->name('masuk-iuran.store');

    // MANAJEMEN DATA (Superadmin)
    Route::get('/manajemen-data', [SuperadminController::class, 'users'])->name('superadmin.users');
    Route::get('/tambah-data', [SuperadminController::class, 'createUser'])->name('superadmin.createUser');
    Route::post('/manajemen-data', [SuperadminController::class, 'storeUser'])->name('superadmin.storeUser');
    Route::get('/manajemen-data/{id}/edit', [SuperadminController::class, 'editUser'])->name('superadmin.editUser');
    Route::put('/manajemen-data/{id}', [SuperadminController::class, 'update'])->name('superadmin.updateUser');
    Route::delete('/manajemen-data/{id}', [SuperadminController::class, 'deleteUser'])->name('superadmin.deleteUser');
});


// --- Rute yang Memerlukan Autentikasi Saja ---
Route::middleware(['auth'])->group(function () {
    Route::get('/download/pdf', [DownloaderController::class, 'download'])->name('download.pdf');
});
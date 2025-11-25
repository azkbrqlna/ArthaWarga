<?php

use App\Http\Controllers\AuthController;
// Controller
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\MasukIuranController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\ProfileWargaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Welcome'));

Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['role.access'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/dashboard/pemasukan', [IuranController::class, 'pemasukan'])->name('pemasukan.index');
    Route::post('/kategori-iuran/create', [IuranController::class, 'kat_iuran_create'])->name('kat_iuran.create');
    Route::delete('/kategori-iuran/{id}', [IuranController::class, 'kat_iuran_delete'])->name('kat_iuran.delete');

    Route::get('/dashboard/kegiatan', [KegiatanController::class, 'create'])->name('kegiatan.create');
    Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');
    Route::get('/kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index');

    // Route::get('/bop', [BopController::class, 'index']);
    // Route::get('/iuran', [IuranController::class, 'index']);
    Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
    Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');

    Route::get('/dashboard/pengumuman', [PengumumanController::class, 'pengumuman'])->name('pengumuman');
    Route::post('/pengumuman/create', [PengumumanController::class, 'pengumuman_create'])->name('pengumuman.create');

    Route::get('/dashboard/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran');
    Route::post('/pengeluaran', [PengeluaranController::class, 'pengeluaran'])->name('pengeluaran.store');
    Route::get('/rincian/{id}', [DashboardController::class, 'rincian'])->name('rincian.show');
    
    Route::get('/profil', [ProfileWargaController::class, 'index'])->name('profil.index');
    Route::put('/profil/update/{id}', [ProfileWargaController::class, 'update'])->name('profil.update');

    Route::get('/kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index');
    
    Route::get('/masuk-iuran', [MasukIuranController::class, 'index'])->name('masuk-iuran.index');
    Route::get('/masuk-iuran/{id}', [MasukIuranController::class, 'show'])->name('masuk-iuran.show');
    Route::post('/masuk-iuran/upload', [MasukIuranController::class, 'store'])->name('masuk-iuran.store');

    Route::get('/approval', [PengumumanController::class, 'approval'])->name('approval');
    Route::patch('/approval/{id}', [PengumumanController::class, 'approval_patch'])->name('approval.patch');
});




<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\MasukIuranController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => Inertia::render('Welcome'));

// 🔐 Login & Logout
Route::get('/login', [AuthController::class, 'index'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware(['role.access'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Ringkasan Pemasukan
    Route::get('/ringkasan/pemasukan', [IuranController::class, 'pemasukan'])->name('pemasukan.index');
    Route::post('/kategori-iuran/create', [IuranController::class, 'kat_iuran_create'])->name('kat_iuran.create');
    Route::delete('/kategori-iuran/{id}', [IuranController::class, 'kat_iuran_delete'])->name('kat_iuran.delete');

    // Kegiatan
    Route::get('/ringkasan/kegiatan', [KegiatanController::class, 'create'])->name('kegiatan.create');
    Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');

    // BOP & Iuran
    Route::get('/bop', [BopController::class, 'index']);
    Route::get('/iuran', [IuranController::class, 'index']);
    Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
    Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');

    // Pengumuman
    Route::get('/ringkasan/pengumuman', [PengumumanController::class, 'pengumuman'])->name('pengumuman');
    Route::post('/pengumuman/create', [PengumumanController::class, 'pengumuman_create'])->name('pengumuman.create');

    // Pengeluaran
    Route::get('/ringkasan/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran');
    Route::post('/pengeluaran', [PengeluaranController::class, 'pengeluaran'])->name('pengeluaran.store');

    // Rincian
    Route::get('/rincian/{id}', [DashboardController::class, 'rincian'])->name('rincian.show');

    // 💧 Masuk Iuran (untuk warga)
    Route::get('/masuk-iuran', [MasukIuranController::class, 'index'])->name('masuk-iuran.index');
    Route::get('/masuk-iuran/{id}', [MasukIuranController::class, 'show'])->name('masuk-iuran.show');
    Route::post('/masuk-iuran/upload', [MasukIuranController::class, 'store'])->name('masuk-iuran.store');
});

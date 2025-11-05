<?php

use App\Http\Controllers\Api\BopApiController;
use App\Http\Controllers\Api\IuranApiController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\MasukIuranController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});



Route::get('/login', [AuthController::class, 'index'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// 📌 Dashboard & Ringkasan
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/ringkasan/pemasukan-bop', function () {
    return Inertia::render(component: 'Ringkasan/Pemasukan_BOP');
});
Route::post('/bop/create', [DashboardController::class, 'bop_create'])->name('bop.create');

Route::get('/superadmin', function () {
    return Inertia::render(component: 'Superadmin');
});
Route::get('/ringkasan/pemasukan', [DashboardController::class, 'pemasukan'])->name('pemasukan');
Route::get('/kegiatan/tambah', [KegiatanController::class, 'create'])->name('kegiatan.create');
Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');


// 📌 Aksi CRUD
Route::get('/bop', [BopController::class, 'index']);
Route::get('/iuran', [IuranController::class, 'index']);
Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');
Route::post('/kategori-iuran/create', [IuranController::class, 'kat_iuran_create'])->name('kat_iuran.create');
Route::delete('/kategori-iuran/{id}', [IuranController::class, 'kat_iuran_delete'])->name('kat_iuran.delete');
Route::get('/pengumuman', [DashboardController::class, 'pengumuman'])->name('pengumuman');
Route::post('/pengumuman/create', [IuranController::class, 'pengumuman_create'])->name('pengumuman.create');

Route::get('/ringkasan/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran');
Route::post('/pengeluaran', [PengeluaranController::class, 'pengeluaran'])->name('pengeluaran.store');
Route::delete('/kategori-iuran/delete/{id}', [IuranController::class, 'kat_iuran_delete'])->name('kat_iuran.delete');
// Route::post('/api/kategori-iuran/create', [IuranController::class, 'kat_iuran_create'])
//     ->name('api.kat_iuran.create');

Route::resource('kegiatan', KegiatanController::class)
    ->only(['index','show','store','update','destroy']);

//untuk masuk iuran warga
Route::resource('masuk-iuran', MasukIuranController::class);

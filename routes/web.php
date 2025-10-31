<?php

use App\Http\Controllers\Api\BopApiController;
use App\Http\Controllers\Api\IuranApiController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\KegiatanController;
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
Route::get('/ringkasan/pemasukan', [DashboardController::class, 'pemasukan'])->name('pemasukan');

// 📌 Aksi CRUD
Route::get('/bop', [BopController::class, 'index']);
Route::get('/iuran', [IuranController::class, 'index']);
Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');

Route::post('/kategori-iuran/create', [IuranController::class, 'kat_iuran_create'])->name('kat_iuran.create');
Route::delete('/kategori-iuran/delete/{id}', [IuranController::class, 'kat_iuran_delete'])->name('kat_iuran.delete');
<<<<<<< HEAD

Route::get('/pengumuman', [DashboardController::class, 'pengumuman'])->name('pengumuman');
=======
Route::resource('kegiatan', KegiatanController::class)
    ->only(['index','show','store','update','destroy']);
>>>>>>> 7ddf5a1b3cb262f171dab8b270d5eceb767ea8e9

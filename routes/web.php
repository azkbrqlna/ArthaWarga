<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
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
Route::prefix('superadmin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Superadmin'); // Dashboard superadmin
    })->name('superadmin.dashboard');

    Route::get('/profil', function () {
        return Inertia::render('Profil'); // Profil superadmin
    })->name('superadmin.profil');
});

Route::get('/manajemen_data', function () {
    return Inertia::render('ManajemenData');
});


// 📌 Aksi CRUD
Route::get('/bop', [BopController::class, 'index']);
Route::get('/iuran', [IuranController::class, 'index']);
Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');

Route::post('/kategori-iuran/create', [IuranController::class, 'kat_iuran_create'])->name('kat_iuran.create');
Route::delete('/kategori-iuran/delete/{id}', [IuranController::class, 'kat_iuran_delete'])->name('kat_iuran.delete');
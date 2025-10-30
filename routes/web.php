<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IuranController;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;

Route::get('/', function () {
    return Inertia::render('Welcome');
});
Route::get('/login', [AuthController::class, 'index'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/ringkasan/pemasukan-bop', [DashboardController::class, 'bop'])->name('bop');
Route::get('/ringkasan/pemasukan-iuran', [DashboardController::class, 'iuran'])->name('iuran');

Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
Route::post('/iuran/create', [BopController::class, 'iuran_create'])->name('iuran.create');


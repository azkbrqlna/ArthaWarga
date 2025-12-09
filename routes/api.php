<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\BopApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\IuranApiController;
use App\Http\Controllers\Api\KategoriIuranApiController;
use App\Http\Controllers\Api\KegiatanApiController;
use App\Http\Controllers\Api\PengeluaranApiController;
//use App\Http\Controllers\Api\PengumumanApiController; 
use App\Http\Controllers\Api\SuperadminApiController;
use App\Http\Controllers\Api\HargaIuranApiController;

// --- PUBLIC (Tanpa Login) ---

Route::get('/check', function () {
    return response()->json(['message' => 'API Connected']);
});

Route::post('/login', [AuthApiController::class, 'login']);


// --- PROTECTED (Wajib Login & Punya Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // 1. Auth User
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // 2. BOP
    Route::resource('bop', BopApiController::class)->only(['index', 'destroy'])
        ->parameters(['bop' => 'id']);
    Route::post('/bop', [BopApiController::class, 'bop_create']); 
    Route::patch('/bop/{id}', [BopApiController::class, 'update']); 
    
    // 3. Iuran
    Route::get('/iuran', [IuranApiController::class, 'index']);      
    Route::post('/iuran/create', [IuranApiController::class, 'iuran_create']); 
    Route::patch('/iuran/update/{id}', [IuranApiController::class, 'iuran_update']);
    Route::delete('/iuran/{id}', [IuranApiController::class, 'iuran_delete']);

   // 4. Kategori Iuran (MASTER NAMA & KONFIGURASI HARGA)
    
    // A. Master Nama Kategori (CRUD Dasar)
    Route::resource('kat_iuran', KategoriIuranApiController::class)->only(['index', 'store', 'show', 'destroy']);
    
    // B. Konfigurasi Harga (
    Route::prefix('kat_iuran')->group(function () {
        Route::get('/harga', [HargaIuranApiController::class, 'index'])->name('kat_iuran.harga.index');
        Route::patch('/harga/{id}', [HargaIuranApiController::class, 'update'])->name('kat_iuran.harga.update');
    });

    // 5. Kegiatan
    Route::get('/kegiatan', [KegiatanApiController::class, 'index']);
    Route::get('/kegiatan/{id}', [KegiatanApiController::class, 'show']);
    Route::post('/kegiatan', [KegiatanApiController::class, 'store']);
    Route::post('/kegiatan/update/{id}', [KegiatanApiController::class, 'update']);
    Route::delete('/kegiatan/{id}', [KegiatanApiController::class, 'destroy']);

    // 5. Kegiatan 
    Route::resource('kegiatan', KegiatanApiController::class)->except(['create', 'edit'])
        ->parameters(['kegiatan' => 'id']);

    // 6. Pengeluaran 
    Route::resource('pengeluaran', PengeluaranApiController::class)->except(['create', 'edit'])
        ->parameters(['pengeluaran' => 'id']);

    // 7. Pengumuman
    // Route::resource('pengumuman', PengumumanApiController::class)->except(['create', 'edit'])
    //  ->parameters(['pengumuman' => 'id']);

    // 8. Superadmin (User Management)
    Route::prefix('admin')->group(function () {
        Route::resource('users', SuperadminApiController::class)->only(['index', 'store', 'show', 'update', 'destroy'])
            ->parameters(['users' => 'id']);
    });

});
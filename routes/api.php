<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\BopApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\IuranApiController;
use App\Http\Controllers\Api\KegiatanApiController;
use App\Http\Controllers\Api\PengeluaranApiController;
use App\Http\Controllers\Api\PengumumanApiController;
use App\Http\Controllers\Api\SuperadminApiController;


Route::get('/check', function () {
    return response()->json(['message' => 'API Connected']);
});

// --- PUBLIC (Tanpa Login) ---
Route::post('/login', [AuthApiController::class, 'login']);


// --- PROTECTED (Wajib Login & Punya Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // 1. Auth User
    Route::post('/logout', [AuthApiController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // 2. BOP
    Route::get('/bop', [BopApiController::class, 'index']);
    Route::post('/bop/create', [BopApiController::class, 'bop_create']); 
    Route::delete('/bop/{id}', [BopApiController::class, 'destroy']);
    Route::patch('/bop/update/{id}', [BopApiController::class, 'update']);

    // 3. Iuran
    Route::get('/iuran', [IuranApiController::class, 'index']);          // History
    Route::post('/iuran/create', [IuranApiController::class, 'iuran_create']); // Bayar
    Route::patch('/iuran/update/{id}', [IuranApiController::class, 'iuran_update']);
    Route::delete('/iuran/{id}', [IuranApiController::class, 'iuran_delete']);

    // 4. Kategori Iuran
    Route::get('/iuran/kategori', [IuranApiController::class, 'kategori']);
    Route::post('/iuran/kategori', [IuranApiController::class, 'kat_iuran_create']);
    Route::delete('/iuran/kategori/{id}', [IuranApiController::class, 'kat_iuran_delete']);

    // 5. Kegiatan
    Route::get('/kegiatan', [KegiatanApiController::class, 'index']);
    Route::get('/kegiatan/{id}', [KegiatanApiController::class, 'show']);
    Route::post('/kegiatan', [KegiatanApiController::class, 'store']);
    Route::patch('/kegiatan/update/{id}', [KegiatanApiController::class, 'update']);
    Route::delete('/kegiatan/{id}', [KegiatanApiController::class, 'destroy']);

    // 6. Pengeluaran
    Route::get('/pengeluaran', [PengeluaranApiController::class, 'index']);
    Route::post('/pengeluaran', [PengeluaranApiController::class, 'store']);
    Route::get('/pengeluaran/{id}', [PengeluaranApiController::class, 'show']);
    Route::patch('/pengeluaran/update/{id}', [PengeluaranApiController::class, 'update']);
    Route::delete('/pengeluaran/{id}', [PengeluaranApiController::class, 'destroy']);

    // 7. Pengumuman
    Route::get('/pengumuman', [PengumumanApiController::class, 'index']);
    Route::post('/pengumuman', [PengumumanApiController::class, 'store']);
    Route::get('/pengumuman/{id}', [PengumumanApiController::class, 'show']);
    Route::patch('/pengumuman/update/{id}', [PengumumanApiController::class, 'update']);
    Route::delete('/pengumuman/{id}', [PengumumanApiController::class, 'destroy']);

    // 8. Superadmin (User Management)
    Route::prefix('admin')->group(function () {
        Route::get('/users', [SuperadminApiController::class, 'index']);
        Route::post('/users', [SuperadminApiController::class, 'store']);
        Route::get('/users/{id}', [SuperadminApiController::class, 'show']);
        Route::patch('/users/update/{id}', [SuperadminApiController::class, 'update']);
        Route::delete('/users/{id}', [SuperadminApiController::class, 'destroy']);
    });

});
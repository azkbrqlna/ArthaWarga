<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BopController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IuranController;
use App\Http\Controllers\Api\KegiatanController;
use App\Http\Controllers\Api\PengeluaranController;
use App\Http\Controllers\Api\PengumumanController;
use App\Http\Controllers\Api\SuperadminController;


Route::get('/check', function () {
    return response()->json(['message' => 'API Connected']);
});

// --- PUBLIC (Tanpa Login) ---
Route::post('/login', [AuthController::class, 'login']);


// --- PROTECTED (Wajib Login & Punya Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // 1. Auth User
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // 2. Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // 3. BOP
    Route::get('/bop', [BopController::class, 'index']);
    Route::post('/bop/create', [BopController::class, 'bop_create']); // Sesuai nama function di controller asli

    // 4. Iuran
    Route::get('/iuran', [IuranController::class, 'index']);          // History
    Route::post('/iuran/create', [IuranController::class, 'iuran_create']); // Bayar

    // 5. Kategori Iuran
    Route::get('/iuran/kategori', [IuranController::class, 'kategori']);
    Route::post('/iuran/kategori', [IuranController::class, 'kat_iuran_create']);
    Route::delete('/iuran/kategori/{id}', [IuranController::class, 'kat_iuran_delete']);

    // 6. Kegiatan
    Route::get('/kegiatan', [KegiatanController::class, 'index']);
    Route::get('/kegiatan/{id}', [KegiatanController::class, 'show']);
    Route::post('/kegiatan', [KegiatanController::class, 'store']);
    Route::post('/kegiatan/{id}/update', [KegiatanController::class, 'update']); // Pakai POST untuk update file
    Route::delete('/kegiatan/{id}', [KegiatanController::class, 'destroy']);

    // 7. Pengeluaran
    Route::get('/pengeluaran', [PengeluaranController::class, 'index']);
    Route::post('/pengeluaran', [PengeluaranController::class, 'store']);

    // 8. Pengumuman
    Route::get('/pengumuman', [PengumumanController::class, 'index']);
    Route::post('/pengumuman', [PengumumanController::class, 'store']);

    // 9. Superadmin (User Management)
    Route::prefix('admin')->group(function () {
        Route::get('/users', [SuperadminController::class, 'index']);
        Route::post('/users', [SuperadminController::class, 'store']);
        Route::get('/users/{id}', [SuperadminController::class, 'show']);
        Route::put('/users/{id}', [SuperadminController::class, 'update']);
        Route::delete('/users/{id}', [SuperadminController::class, 'destroy']);
    });

});
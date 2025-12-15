<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Controllers
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\BopApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\IuranApiController;
use App\Http\Controllers\Api\KategoriIuranApiController;
use App\Http\Controllers\Api\KegiatanApiController;
use App\Http\Controllers\Api\PengeluaranApiController;
use App\Http\Controllers\Api\SuperadminApiController;
use App\Http\Controllers\Api\SpjApiController;
use App\Http\Controllers\Api\SpjPdfApiController;
use App\Http\Controllers\Api\HargaIuranApiController;
use App\Http\Controllers\Api\TagihanBulananApiController;
use App\Http\Controllers\Api\LaporanController;
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
    
    // B. Konfigurasi Harga
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
    // route untuk melihat spj pdf yang ada di rincian kegiatan
    Route::get('/spj/pdf/{id}', [SpjPdfApiController::class, 'generate'])->name('api.spj.download');

    // 6. Pengeluaran 
    Route::get('/pengeluaran', [PengeluaranApiController::class, 'index']);
    Route::post('/pengeluaran', [PengeluaranApiController::class, 'store']);
    Route::get('/pengeluaran/{id}', [PengeluaranApiController::class, 'show']);
    Route::post('/pengeluaran/update/{id}', [PengeluaranApiController::class, 'update']);
    Route::delete('/pengeluaran/{id}', [PengeluaranApiController::class, 'destroy']);
    Route::get('/spj/{id}/data', [SpjApiController::class, 'show']);
    // Route untuk mengambil list penerima (dropdown)
    Route::get('/list-penerima', [App\Http\Controllers\Api\PengeluaranApiController::class, 'getListPenerima']);

    // 7. Pengumuman (Dikomenter di kode asli)
    // Route::resource('pengumuman', PengumumanApiController::class)->except(['create', 'edit'])
    //  ->parameters(['pengumuman' => 'id']);

    // 8. Superadmin (User Management)
    Route::prefix('admin')->group(function () {
        Route::resource('users', SuperadminApiController::class)->only(['index', 'store', 'show', 'update', 'destroy'])
            ->parameters(['users' => 'id']);
    }); 
    
    // =========================================================================
    // 9. TAGIHAN BULANAN (API)
    // =========================================================================

    // API WARGA (Semua user terautentikasi bisa akses)
    Route::get('warga/tagihan', [TagihanBulananApiController::class, 'indexWarga'])->name('tagihan.warga.index.api'); 
    Route::post('warga/tagihan/upload', [TagihanBulananApiController::class, 'uploadBukti'])->name('tagihan.upload.api'); 

    // API ADMIN/RT (Perlu middleware pengecek role/permission)
    Route::prefix('rt/tagihan')->group(function () {
        Route::get('/', [TagihanBulananApiController::class, 'indexRt'])->name('tagihan.rt.index.api'); 
        Route::post('/', [TagihanBulananApiController::class, 'store'])->name('tagihan.store.api'); 
        Route::put('/{id}', [TagihanBulananApiController::class, 'update'])->name('tagihan.update.api'); 
        Route::delete('/{id}', [TagihanBulananApiController::class, 'destroy'])->name('tagihan.destroy.api');
        Route::post('/{id}/approve', [TagihanBulananApiController::class, 'approve'])->name('tagihan.approve.api'); 
        Route::post('/{id}/decline', [TagihanBulananApiController::class, 'decline'])->name('tagihan.decline.api'); 
    });
    Route::get('/laporan/header', [LaporanController::class, 'header']);
});

<?php

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\BopApiController;
use App\Http\Controllers\Api\IuranApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello from API']);
});

Route::post('/login', [AuthApiController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthApiController::class, 'logout']);

    Route::get('/bop', [BopApiController::class, 'index']);
    Route::post('/bop/create', [BopApiController::class, 'bop_create']);

    Route::get('/iuran', [IuranApiController::class, 'index']);
    Route::post('/iuran/create', [IuranApiController::class, 'iuran_create']);
    
    Route::get('/iuran/kategori', [IuranApiController::class, 'kategori']);
    Route::post('/iuran/kategori', [IuranApiController::class, 'kat_iuran_create']);
    Route::delete('/iuran/kategori/{id}', [IuranApiController::class, 'kat_iuran_delete']);

});

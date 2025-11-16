<?php

use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\BopApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello from API']);
});

Route::post('/login', [AuthApiController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthApiController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bop', [BopApiController::class, 'index']);
    Route::post('/bop/create', [BopApiController::class, 'bop_create']);
});

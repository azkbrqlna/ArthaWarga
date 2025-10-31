<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemasukanIuran;

class IuranApiController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => PemasukanIuran::select('kat_iuran_id', 'tgl', 'nominal', 'ket', 'jml_kk', 'total')
                ->latest()
                ->get()
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PemasukanBOP;

class BopApiController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => PemasukanBOP::select('tgl', 'nominal', 'ket', 'bkt_nota')
                ->latest()
                ->get()
        ]);
    }
}

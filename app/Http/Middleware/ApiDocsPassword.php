<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApiDocsPassword
{
    public function handle(Request $request, Closure $next)
    {
        $password = 'scrumble123'; // Variabel ini tidak digunakan di sini

        if ($request->session()->get('api_docs_access') !== true) {
            // Jika sesi 'api_docs_access' tidak ada,
            // langsung diarahkan ke form password.
            return redirect()->route('docs.password.form');
        }

        return $next($request); // Jika sesi ada, lanjutkan ke dokumentasi.
    }
}
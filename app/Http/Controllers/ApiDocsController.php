<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ApiDocsController extends Controller
{
    private $password = 'password123'; // Password yang sebenarnya

    public function showPasswordForm()
    {
        // Tampilkan view form password (Anda perlu membuat view ini)
        return view('docs.password');
    }

    public function processPassword(Request $request)
    {
        // Validasi input
        $request->validate(['password' => 'required|string']);

        // Cek apakah password yang dimasukkan benar
        if ($request->input('password') === $this->password) {
            // Jika benar, set sesi untuk memberikan akses
            $request->session()->put('api_docs_access', true);

            // Redirect pengguna kembali ke halaman dokumentasi Scramble
            // DIGANTI: 'scramble.docs.index' -> 'scramble.docs.ui'
            return redirect()->route('scramble.docs.ui'); 
        }

        // Jika salah, kembalikan dengan pesan error
        return back()->withErrors(['password' => 'Kata sandi salah.'])->withInput();
    }
}
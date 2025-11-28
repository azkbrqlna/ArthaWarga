<?php

return [
    // ... konfigurasi lainnya (Contoh: 'api_path', 'domain', dll.)

    'middleware' => [
        // Middleware bawaan Scramble yang wajib ada (Contoh-contoh di bawah TIDAK boleh dihapus)
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Session\Middleware\StartSession::class,
        // ... dll. (Middleware Scramble lainnya)

        // Tambahkan Middleware kustom Anda di sini:
        \App\Http\Middleware\ApiDocsPassword::class,
    ],

    // ... konfigurasi lainnya
];
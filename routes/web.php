<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BopController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DownloaderController;
use App\Http\Controllers\IuranController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\MasukIuranController;
use App\Http\Controllers\PengeluaranController;
// use App\Http\Controllers\PengumumanController; 
use App\Http\Controllers\ProfileWargaController;
use App\Http\Controllers\ApiDocsController;
use App\Http\Controllers\SpjController;
use App\Http\Controllers\KategoriIuranController;
use App\Http\Controllers\HargaIuranController;
use App\Http\Controllers\SuperadminController;
use App\Http\Controllers\TagihanBulananController;
use Inertia\Inertia;

// --- API Documentation Password Protection ---

Route::get('/docs/password', [ApiDocsController::class, 'showPasswordForm'])->name('docs.password.form');
Route::post('/docs/password', [ApiDocsController::class, 'processPassword'])->name('docs.password.process');

// --- Otentikasi Publik ---

Route::get('/', fn() => Inertia::render('Welcome'));
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// --- Rute yang Memerlukan Akses Role (Umumnya Warga/Admin) ---

Route::middleware(['role.access'])->group(function () {
    
    // DASHBOARD & RINCIAN
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/rincian/{id}', [DashboardController::class, 'rincian'])->name('rincian.show');
    
    // IURAN & PEMASUKAN (Admin/Bendahara)
    Route::get('/dashboard/pemasukan', [IuranController::class, 'pemasukan'])->name('pemasukan.index');
    Route::post('/bop/create', [BopController::class, 'bop_create'])->name('bop.create');
    Route::post('/iuran/create', [IuranController::class, 'iuran_create'])->name('iuran.create');

    // KATEGORI IURAN (TERPISAH ANTARA NAMA & HARGA)
    
    // A. Konfigurasi Harga (Menggunakan HargaIuranController)
    Route::get('/kat-iuran', [HargaIuranController::class, 'index'])->name('kat_iuran.index'); 
    Route::put('/kat-iuran/{harga_iuran}', [HargaIuranController::class, 'update'])->name('kat_iuran.update'); 
    
    // B. Master Nama Kategori (Menggunakan KategoriIuranController)
    Route::get('/kategori-setting', [KategoriIuranController::class, 'index'])->name('kategori.index');
    Route::post('/kat-iuran', [KategoriIuranController::class, 'store'])->name('kat_iuran.store'); 
    Route::delete('/kat-iuran/{kat_iuran}', [KategoriIuranController::class, 'destroy'])->name('kat_iuran.destroy'); 

    // KEGIATAN
    
    Route::get('/dashboard/kegiatan', [KegiatanController::class, 'create'])->name('kegiatan.create');
    Route::post('/kegiatan', [KegiatanController::class, 'store'])->name('kegiatan.store');
    Route::get('/kegiatan', [KegiatanController::class, 'index'])->name('kegiatan.index'); 
    

    // PENGELUARAN & SPJ
    Route::get('/dashboard/pengeluaran', [PengeluaranController::class, 'index'])->name('pengeluaran');
    Route::post('/pengeluaran', [PengeluaranController::class, 'store'])->name('pengeluaran.store');
    Route::get('/spj/download/{id}', [SpjController::class, 'download'])->name('spj.download');
    
    // PROFIL WARGA
    Route::get('/profil', [ProfileWargaController::class, 'index'])->name('profil.index');
    Route::put('/profil/update/{id}', [ProfileWargaController::class, 'update'])->name('profil.update');
    
    // PEMBAYARAN IURAN WARGA (Upload Bukti Bayar)
    Route::post('/profil/photo/{id}', [ProfileWargaController::class, 'updatePhoto'])->name('profil.updatePhoto');
    Route::delete('/profil/photo/{id}', [ProfileWargaController::class, 'deletePhoto'])->name('profil.deletePhoto');

    // MANAJEMEN DATA (Superadmin)
    Route::get('/manajemen-data', [SuperadminController::class, 'users'])->name('superadmin.users');
    Route::get('/tambah-data', [SuperadminController::class, 'createUser'])->name('superadmin.createUser');
    Route::post('/manajemen-data', [SuperadminController::class, 'storeUser'])->name('superadmin.storeUser');
    Route::get('/manajemen-data/{id}/edit', [SuperadminController::class, 'editUser'])->name('superadmin.editUser');
    Route::put('/manajemen-data/{id}', [SuperadminController::class, 'update'])->name('superadmin.updateUser');
    Route::delete('/manajemen-data/{id}', [SuperadminController::class, 'deleteUser'])->name('superadmin.deleteUser');

    Route::get('/tagihan-bulanan/create', [TagihanBulananController::class, 'create'])->name('tagihan.create');
    Route::post('/tagihan-bulanan/store', [TagihanBulananController::class, 'store'])->name('tagihan.store');
    Route::post('/tagihan-bulanan/upload', [TagihanBulananController::class, 'upload_bukti'])->name('tagihan.upload');
    
    //UNTUK RT
    Route::get('/tagihan-bulanan/approval', [TagihanBulananController::class, 'approval_rt'])->name('tagihan.approval');
    Route::patch('/tagihan-bulanan/{id}/approve', [TagihanBulananController::class, 'approve'])->name('tagihan.approve');
    Route::patch('/tagihan-bulanan/{id}/decline', [TagihanBulananController::class, 'decline'])->name('tagihan.decline');
    
    Route::get('/tagihan-bulanan/index', [TagihanBulananController::class, 'index_rt'])->name('tagihan.rt.index');
    Route::get('/tagihan-bulanan/{id}/edit', [TagihanBulananController::class, 'edit'])->name('tagihan.edit');
    Route::put('/tagihan-bulanan/{id}', [TagihanBulananController::class, 'update'])->name('tagihan.update');
    Route::delete('/tagihan-bulanan/{id}', [TagihanBulananController::class, 'destroy'])->name('tagihan.destroy');
    
    //UNTUK WARGA
    Route::get('/tagihan-bulanan', [TagihanBulananController::class, 'index_warga'])->name('tagihan.warga.index');
    Route::get('/tagihan-bulanan/{id}', [TagihanBulananController::class, 'show_warga'])->name('tagihan.warga.show');
    Route::post('/tagihan-bulanan/bayar', [TagihanBulananController::class, 'bayar'])->name('tagihan.bayar');
});
 
// --- Rute yang Memerlukan Autentikasi Saja ---
Route::middleware(['auth'])->group(function () {
    Route::get('/download/pdf', [DownloaderController::class, 'download'])->name('download.pdf');
});
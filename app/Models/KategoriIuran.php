<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriIuran extends Model
{
    use HasFactory; 
    
    protected $table = 'kat_iuran';
    
    
    protected $fillable = [
        'nm_kat', // HANYA NAMA KATEGORI
    ];

    // ... Relasi lama ...

    /**
     * Relasi One-to-One: Ke Konfigurasi Harga
     */
    public function hargaKonfigurasi() 
    {
        // Relasi ini akan mencari entri di tabel harga_iuran
        return $this->hasOne(HargaIuran::class, 'kat_iuran_id', 'id');
    }

    /** * --- TAMBAHKAN BAGIAN INI ---
     * Relasi ke Data Pemasukan/Transaksi
     * Ini digunakan untuk mengecek apakah kategori ini sudah pernah dipakai transaksi.
     */
    public function pemasukanIuran(): HasMany
    {
        // Asumsi: Model transaksi Anda bernama 'PemasukanIuran'
        // dan foreign key di tabel transaksi adalah 'kat_iuran_id'
        return $this->hasMany(PemasukanIuran::class, 'kat_iuran_id', 'id');
    }
}
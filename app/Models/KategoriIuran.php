<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
}
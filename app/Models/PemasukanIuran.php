<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemasukanIuran extends Model
{
    use HasFactory;

    protected $table = 'masuk_iuran';
    
    protected $fillable = [
        'kat_iuran_id', 
        'tgl',
        'nominal',
        'ket',
    ];

    // Relasi ke tabel Kategori
    public function kategori_iuran()
    {
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id', 'id');
    }

    // Relasi ke Pengeluaran (Jika memang ada relasinya)
    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'masuk_iuran_id', 'id');
    }
}
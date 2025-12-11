<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory; 

    protected $table = 'keg'; 
    
    protected $fillable = [
        'nm_keg', 
        'tgl_mulai', 
        'tgl_selesai', 
        'pj_keg', 
        'panitia', 
        'dok_keg',
        'kat_keg_id',       
        'rincian_kegiatan'
    ];

    protected $casts = [
        'dok_keg' => 'array', 
        'tgl_mulai' => 'date', 
        'tgl_selesai' => 'date', 
    ];

    // 👇 PERBAIKAN: Ubah hasOne menjadi hasMany
    public function pengeluaran()
    {
        // 1 Kegiatan -> BANYAK Pengeluaran
        return $this->hasMany(Pengeluaran::class, 'keg_id', 'id');
    }

    public function kategori_relasi()
    {
        return $this->belongsTo(KategoriKegiatan::class, 'kat_keg_id', 'id');
    }

    public function subkategori_kegiatan()
    {
        return $this->hasMany(SubkatKeg::class);
    }
}
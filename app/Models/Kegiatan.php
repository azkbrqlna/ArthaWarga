<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    protected $table = 'keg'; 
    
    protected $fillable = [
        'nm_keg', 
        'tgl_mulai', 
        'tgl_selesai', 
        'pj_keg', 
        'panitia', 
        'dok_keg' 
    ];

    protected $casts = [
        'dok_keg' => 'array',
        'tgl_mulai' => 'date', 
        'tgl_selesai' => 'date', 
    ];

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class);
    }

    public function kategori_kegiatan()
    {
        return $this->belongsTo(KategoriKegiatan::class);
    }

}

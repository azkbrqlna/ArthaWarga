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
        'dok_keg',
    ];

    protected $dates = [
        'tgl_mulai',
        'tgl_selesai'
    ];

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class);
    }

    public function subkategori_kegiatan()
    {
        return $this->hasMany(SubkatKeg::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubkatKeg extends Model
{
    protected $table = 'subkat_keg';

    public function kategori_kegiatan()
    {
        return $this->belongsTo(KategoriKegiatan::class);
    }

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }
}

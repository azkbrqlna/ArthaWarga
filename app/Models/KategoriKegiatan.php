<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriKegiatan extends Model
{
    protected $table = 'kat_keg';

    public function subkategori_kegiatan()
    {
        return $this->hasMany(SubkatKeg::class);
    }
}

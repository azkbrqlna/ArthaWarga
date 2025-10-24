<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    protected $table = 'keg';

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class);
    }

    public function subkategori_kegiatan()
    {
        return $this->hasMany(SubkatKeg::class);
    }
}

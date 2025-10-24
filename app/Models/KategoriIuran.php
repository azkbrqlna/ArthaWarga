<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriIuran extends Model
{
    protected $table = 'kat_iuran';

    //public function rumus_iuran()
    
    public function masuk_iuran()
    {
        return $this->hasMany(PemasukanIuran::class);
    }
}

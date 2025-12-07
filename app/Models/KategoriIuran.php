<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KategoriIuran extends Model
{
    protected $table = 'kat_iuran';
    protected $fillable = ['nm_kat'];

    public function tagihan_bulanan()
    {
        return $this->hasMany(TagihanBulanan::class);
    }

    public function masuk_iuran() 
    {
        return $this->hasMany(PemasukanIuran::class);
    }
}

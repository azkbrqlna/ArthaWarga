<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KategoriIuran extends Model
{
    use HasFactory;
    protected $table = 'kat_iuran';
    protected $primaryKey = 'id';
    protected $fillable = ['nm_kat'];

    //public function rumus_iuran()
    
    public function masuk_iuran()
    {
        return $this->hasMany(PemasukanIuran::class);
    }
}

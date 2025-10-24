<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemasukanIuran extends Model
{
    protected $table = 'masuk_iuran';

    public function user_iuran()
    {
        return $this->hasMany(UserIuran::class);
    }
    
    public function kategori_iuran()
    {
        return $this->belongsTo(KategoriIuran::class);
    }

    public function total()
    {
        return $this->hasMany(Total::class);
    }
    
}

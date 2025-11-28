<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kota extends Model
{
    protected $table = 'kota';
    
    public function kecamatans()
    {
        return $this->hasMany(Kecamatan::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
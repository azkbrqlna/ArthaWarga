<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemasukanBOP extends Model
{
    protected $table = 'masuk_bop';
    protected $fillable = [
        'sumber_id', 
        'tgl',
        'nominal',
        'ket',
        'bkt_nota'
    ];

    public function total()
    {
        return $this->hasMany(Total::class);
    }
}

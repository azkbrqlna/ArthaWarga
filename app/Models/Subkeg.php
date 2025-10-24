<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subkeg extends Model
{
    protected $table = 'subkeg';
    
    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }
}

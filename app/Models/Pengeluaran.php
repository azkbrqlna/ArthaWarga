<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'tgl',
        'keg_id',
        'tipe',
        'nominal',
        'ket',
        'bkt_nota',
    ];

    public function total()
    {
        return $this->hasMany(Total::class);
    }

    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class, 'keg_id');
    }
}

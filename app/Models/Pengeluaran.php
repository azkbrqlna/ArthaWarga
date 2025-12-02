<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'tgl',
        'keg_id',
        'tipe',
        'nominal',
        'ket',
        'toko',
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

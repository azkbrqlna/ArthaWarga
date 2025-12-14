<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';

    protected $fillable = [
        'tgl',
        'keg_id',
        'nominal',
        'ket',
        'toko',
        'bkt_nota',
        'masuk_bop_id',
        'masuk_iuran_id',
        'penerima',
    ];


    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }

    public function pemasukan_bop()
    {
        return $this->belongsTo(PemasukanBOP::class);
    }

    public function pemasukan_iuran()
    {
        return $this->belongsTo(PemasukanIuran::class);
    }
}
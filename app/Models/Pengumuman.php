<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengumuman extends Model
{
    protected $table = 'pengumuman';

    protected $fillable = [
        'judul',
        'ket',
        'jumlah',
        'kat_iuran_id',
    ];

    public function masuk_iuran()
    {
        return $this->hasMany(PemasukanIuran::class);
    }

    public function kat_iuran()
    {
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id');
    }
}
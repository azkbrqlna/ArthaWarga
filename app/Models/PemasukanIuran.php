<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemasukanIuran extends Model
{
    protected $table = 'masuk_iuran';

    protected $fillable = [
        'kat_iuran_id',
        'tgl',
        'nominal',
        'ket',
        'jml_kk',
        'total',
        'bkt_byr',
        'bkt_nota',
    ];

    public function pengumuman()
    {
        return $this->belongsTo(Pengumuman::class);
    }

    public function kategori_iuran()
    {
        // tambahkan foreign key & local key biar eksplisit
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id', 'id');
    }

    public function total()
    {
        return $this->hasMany(Total::class);
    }
}

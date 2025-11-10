<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemasukanIuran extends Model
{
    protected $table = 'masuk_iuran';

    protected $fillable = [
        'usr_id',
        'pengumuman_id',
        'kat_iuran_id',
        'tgl',
        'nominal',
        'ket',
        'bkt_byr',
        'tgl_byr',
        'tgl_approved',
        'status',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

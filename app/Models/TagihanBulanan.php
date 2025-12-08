<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TagihanBulanan extends Model
{
    protected $table = 'tagihan_bulanan';

    protected $fillable = [
        'usr_id',
        'kat_iuran_id',
        'bulan',
        'tahun',
        'mtr_bln_lalu',
        'mtr_skrg',
        'status',
        'harga_meteran',
        'harga_sampah',
        'abonemen',
        'jimpitan_air',
        'tgl_byr',
        'bkt_byr',
        'tgl_approved',
        'nominal',
    ];

   public function user()
    {
        return $this->belongsTo(User::class, 'usr_id');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id');
    }
}
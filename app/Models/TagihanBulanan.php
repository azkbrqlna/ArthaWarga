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
        'tgl_byr',
        'bkt_byr',
        'tgl_approved',
        'nominal',
    ];
}

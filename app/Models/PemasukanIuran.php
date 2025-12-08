<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemasukanIuran extends Model
{
    use HasFactory;

    // Nama tabel di database
    protected $table = 'masuk_iuran';

    // Kolom yang BOLEH diisi (disesuaikan dengan screenshot database Anda yang 'image_e9689f.jpg')
    // Kolom 'status', 'usr_id', 'bkt_byr' DIHAPUS karena tidak ada di tabel database tersebut.
    protected $fillable = [
        'kat_iuran_id',
        'tgl',
        'nominal',
        'ket',
    ];

    // Relasi ke tabel Kategori
    public function kategori_iuran()
    {
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id', 'id');
    }

    // Relasi ke Pengeluaran (Jika memang ada relasinya)
    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class);
    }
}
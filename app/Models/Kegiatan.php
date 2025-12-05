<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kegiatan extends Model
{
    use HasFactory;

    protected $table = 'keg'; 
    protected $guarded = [];
    
    // ✅ UPDATE: Tambahkan 'kat_keg_id' dan 'rincian_kegiatan'
    protected $fillable = [
        'nm_keg', 
        'tgl_mulai', 
        'tgl_selesai', 
        'pj_keg', 
        'panitia', 
        'dok_keg',
        'kat_keg_id',       // Kategori
        'rincian_kegiatan'  // Deskripsi Rincian
    ];

    protected $casts = [
        // 'dok_keg' => 'array', // ⚠️ Dimatikan dulu karena controller menyimpan string path, bukan array JSON
        'tgl_mulai' => 'date', 
        'tgl_selesai' => 'date', 
    ];

    // Relasi ke Pengeluaran
    public function pengeluaran()
    {
        // Parameter kedua 'keg_id' adalah nama kolom di tabel pengeluaran
        return $this->hasOne(Pengeluaran::class, 'keg_id', 'id');
    }

    // ✅ UPDATE: Relasi ke Kategori
    public function kategori_relasi()
    {
        // Menghubungkan kolom 'kat_keg_id' di tabel keg dengan tabel kat_keg
        return $this->belongsTo(KatKeg::class, 'kat_keg_id', 'id');
    }

    // Relasi Subkategori (Kode lama Anda)
    public function subkategori_kegiatan()
    {
        return $this->hasMany(SubkatKeg::class);
    }
}
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

    // --- BAGIAN INI DIUBAH ---
    // Ganti nama fungsi dari 'kat_iuran' menjadi 'kategori'
    public function kategori()
    {
        // Karena nama fungsinya 'kategori' tapi kolom di database 'kat_iuran_id',
        // kita WAJIB menuliskan 'kat_iuran_id' sebagai parameter kedua.
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id');
    }
    // -------------------------
}
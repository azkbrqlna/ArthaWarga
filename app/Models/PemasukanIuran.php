<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PemasukanIuran extends Model
{
    use HasFactory;

    protected $table = 'masuk_iuran';
    
    protected $fillable = [
        'kat_iuran_id', 
        'usr_id',     // Wajib diisi saat membuat tagihan atau transaksi.
        'tgl',
        'nominal',
        'ket',
        'status',     // Status pembayaran (tagihan, pending, approved).
        'bkt_byr',    // Bukti bayar
        'tgl_byr',    // 💡 Tambahkan tgl_byr karena digunakan di controller
        // 'pengumuman_id', // 💡 Hapus ini, karena logika pengumuman sudah dihapus
    ];

    public function kategori_iuran()
    {
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id', 'id');
    }

    public function pengeluaran()
    {
        // 💡 REVISI 1: Tambahkan Foreign Key eksplisit (masuk_iuran_id)
        // Ini memastikan Eloquent tahu foreign key mana yang merujuk tabel ini.
        return $this->hasMany(Pengeluaran::class, 'masuk_iuran_id', 'id');
    }

    // 💡 REVISI 2: Tambahkan relasi ke User (opsional, tapi disarankan)
    public function user()
    {
        // Asumsi nama tabel user adalah 'usr' atau 'users', foreign key adalah 'usr_id'
        return $this->belongsTo(User::class, 'usr_id', 'id');
    }
}
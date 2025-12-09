<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HargaIuran extends Model
{
    use HasFactory; 
    
    // Nama tabel di database
    protected $table = 'harga_iuran';
    
    protected $fillable = [
        'kat_iuran_id',    
        'harga_meteran',    
        'abonemen',         
        'jimpitan_air',     
        'harga_sampah'      
    ];

    /**
     * Relasi One-to-One: Kembali ke Kategori Master
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriIuran::class, 'kat_iuran_id', 'id');
    }
}
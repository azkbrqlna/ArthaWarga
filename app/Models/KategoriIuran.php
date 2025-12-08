<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KategoriIuran extends Model
{
    use HasFactory; 

    
    protected $table = 'kat_iuran';
    
    
    protected $fillable = [
        'nm_kat', 
        'harga_meteran', 
        'abonemen',      
        'jimpitan_air',  
        'harga_sampah'   
    ];

    
    /**
     * Relasi ke Tagihan Bulanan (One-to-Many)
     */
    public function tagihanBulanan() 
    {
        
        return $this->hasMany(TagihanBulanan::class, 'kat_iuran_id', 'id');
    }

    
    /**
     * Relasi ke Pemasukan Iuran (One-to-Many)
     */
    public function pemasukanIuran() 
    {
        
        return $this->hasMany(PemasukanIuran::class, 'kat_iuran_id', 'id');
    }
}
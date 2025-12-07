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

    
    public function tagihan_bulanan()
    {
        
        return $this->hasMany(TagihanBulanan::class, 'kat_iuran_id', 'id');
    }

    
    public function masuk_iuran() 
    {
        
        return $this->hasMany(PemasukanIuran::class, 'kat_iuran_id', 'id');
    }
}
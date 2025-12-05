<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KatKeg extends Model
{
    use HasFactory;

    // Memberitahu Laravel kalau nama tabel di database adalah 'kat_keg'
    protected $table = 'kat_keg';
    
    // Kolom apa saja yang boleh diisi
    protected $guarded = [];
}
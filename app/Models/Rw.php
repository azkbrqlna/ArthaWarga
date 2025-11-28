<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rw extends Model
{
    protected $table = 'rw';

    protected $fillable = ['kelurahan_id', 'rw'];

    // Relasi ke Induk (Kelurahan)
    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }

    // Relasi ke Anak (RT)
    public function rts()
    {
        return $this->hasMany(Rt::class);
    }

    // Relasi Langsung ke User (Karena di tabel usr ada rw_id)
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
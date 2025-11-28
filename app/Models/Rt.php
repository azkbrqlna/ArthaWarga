<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rt extends Model
{
    protected $table = 'rt';

    protected $fillable = ['rw_id', 'rt'];

    // Relasi ke Induk (RW)
    public function rw()
    {
        return $this->belongsTo(Rw::class);
    }

    // Relasi Langsung ke User (Karena di tabel usr ada rt_id)
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
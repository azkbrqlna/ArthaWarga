<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kelurahan extends Model
{
    protected $table = 'kelurahan';

    // Kode pos dihapus dari sini sesuai request terakhir (input manual di user)
    protected $fillable = ['kecamatan_id', 'nama_kelurahan'];

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
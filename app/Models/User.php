<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'email', 'no_kk','password', 'nm_lengkap', 'foto_profil', 'no_hp',
        'kode_prov', 'kode_kota_kab', 'kode_kec', 'kode_desa',
        'rt_rw','kode_pos'
    ];

    protected $hidden = ['password'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}

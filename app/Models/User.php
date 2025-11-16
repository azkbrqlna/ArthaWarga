<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    
    protected $table = 'usr';
    protected $fillable = [
        'email', 'no_kk','password', 'nm_lengkap', 'foto_profil', 'no_hp',
        'kode_prov', 'kode_kota_kab', 'kode_kec', 'kode_desa',
        'rt_rw','kode_pos'
    ];


    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function masuk_iuran()
    {
        return $this->hasMany(PemasukanIuran::class);
    }
}

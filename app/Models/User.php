<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'usr';
    protected $fillable = [
        'email', 'no_kk','password', 'nm_lengkap', 'foto_profil', 'no_hp',
        'alamat', 'rt', 'rw', 'kode_pos'
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

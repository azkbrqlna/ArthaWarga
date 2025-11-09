<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'usr';
    protected $fillable = [
        'nm_lengkap', 'no_kk', 'email', 'password', 'no_hp' , 'role_id', 'status', 'alamat', 'foto_profil',
        'rt', 'rw','kode_pos'
    ];

    protected $hidden = [
        'password',
        'remember_token', 
    ];

    protected $casts = [
        'password' => 'hashed', // Gunakan 'hashed' untuk Laravel 10.x+
        'email_verified_at' => 'datetime',
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

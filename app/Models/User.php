<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
        protected $table = 'usr';
    protected $fillable = [
        'nm_lengkap', 
        'no_kk', 
        'email', 
        'password', 
        'no_hp', 
        'role_id', 
        'status', 
        'alamat', 
        'foto_profil',
        'kode_pos',
        'rw',
        'rt',

        'kota_id',
        'kecamatan_id',
        'kelurahan_id',
    ];

    protected $hidden = [
        'password',
        'remember_token', 
    ];

    protected $casts = [
        'password' => 'hashed',
        'email_verified_at' => 'datetime',
    ];

    
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }


    public function kota()
    {
        return $this->belongsTo(Kota::class);
    }

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }

    public function kelurahan()
    {
        return $this->belongsTo(Kelurahan::class);
    }

    public function tagihan_bulanan()
    {
        return $this->hasMany(TagihanBulanan::class);
    }

    public function pemasukan_iuran()
    {
        // Foreign Key di tabel masuk_iuran adalah 'usr_id'
        // Local Key di tabel usr adalah 'id'
        return $this->hasMany(PemasukanIuran::class, 'usr_id', 'id');
    }
}
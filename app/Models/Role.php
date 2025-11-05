<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\RoleResource;

class Role extends Model
{
    protected $table = 'role';
    protected $fillable = ['nm_role', 'ket'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function resources()
    {
        return $this->hasMany(RoleResource::class);
    }
}

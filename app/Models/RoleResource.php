<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoleResource extends Model
{
    protected $table = 'role_rsc';

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    
}

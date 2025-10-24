<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserIuran extends Model
{
    protected $table = 'usr_iuran';

    public function user() 
    {
        return $this->belongsTo(User::class);
    }

    public function masuk_iuran() {
        return $this->belongsTo(PemasukanIuran::class);
    }
}

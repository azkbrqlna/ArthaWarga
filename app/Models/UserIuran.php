<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserIuran extends Model
{
    protected $table = 'usr_iuran';

    // ✅ tambahkan ini biar mass assignment gak error
    protected $fillable = [
        'usr_id',
        'masuk_iuran_id',
        'tgl',
        'is_paid',
        'is_approved',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'usr_id', 'id');
    }

    public function masuk_iuran()
    {
        return $this->belongsTo(PemasukanIuran::class, 'masuk_iuran_id', 'id');
    }
}

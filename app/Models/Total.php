<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Total extends Model
{
    protected $table = 'total';

    public function masuk_bop()
    {
        return $this->belongsTo(PemasukanBOP::class);
    }

    public function masuk_iuran()
    {
        return $this->belongsTo(PemasukanIuran::class);
    }

    public function pengeluaran()
    {
        return $this->belongsTo(Pengeluaran::class);
    }
}

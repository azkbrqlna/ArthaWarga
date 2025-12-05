<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKotasTable extends Migration
{
    public function up(): void {
    Schema::create('kota', function (Blueprint $table) {
        $table->id();
        $table->string('nama_kota');
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('kota');
    }
}
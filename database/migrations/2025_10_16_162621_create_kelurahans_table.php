<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKelurahansTable extends Migration
{
    public function up(): void {
    Schema::create('kelurahan', function (Blueprint $table) {
        $table->id();
        $table->foreignId('kecamatan_id')->constrained('kecamatan')->cascadeOnDelete();
        $table->string('nama_kelurahan');
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('kelurahan');
    }
}
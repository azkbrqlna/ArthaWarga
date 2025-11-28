<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKecamatansTable extends Migration
{
    public function up(): void {
    Schema::create('kecamatan', function (Blueprint $table) {
        $table->id();
        $table->foreignId('kota_id')->constrained('kota')->cascadeOnDelete();
        $table->string('nama_kecamatan');
        $table->timestamps();
    });
}

    public function down()
    {
        Schema::dropIfExists('kecamatan');
    }
}
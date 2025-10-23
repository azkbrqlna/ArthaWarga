<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('keg', function (Blueprint $table) {
            $table->id();
            $table->string('nm_keg');
            $table->date('tgl_mulai');
            $table->date('tgl_selesai');
            $table->string('pj_keg');
            $table->string('panitia');
            $table->string('dok_keg');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('keg');
    }
};

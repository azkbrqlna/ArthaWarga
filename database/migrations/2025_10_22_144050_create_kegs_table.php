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
            $table->foreignId('kat_keg_id')->constrained('kat_keg')->cascadeOnDelete();
            $table->string('nm_keg');
            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_selesai')->nullable();
            $table->string('pj_keg')->nullable();
            $table->string('panitia')->nullable();
            $table->json('dok_keg')->nullable();
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
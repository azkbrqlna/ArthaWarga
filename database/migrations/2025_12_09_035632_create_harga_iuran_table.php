<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PENTING: Gunakan Schema::create, bukan Schema::table
        Schema::create('harga_iuran', function (Blueprint $table) { 
            $table->id();
            
            // Foreign Key merujuk ke tabel master 'kat_iuran'
            $table->foreignId('kat_iuran_id')->constrained('kat_iuran')->cascadeOnDelete();
            
            // Kolom Konfigurasi Harga/Persentase
            $table->integer('harga_meteran')->nullable();
            $table->integer('abonemen')->nullable();
            $table->integer('jimpitan_air')->nullable();
            $table->integer('harga_sampah')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('harga_iuran');
    }
};
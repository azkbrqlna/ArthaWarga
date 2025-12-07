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
        Schema::create('tagihan_bulanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kat_iuran_id')->constrained('kat_iuran')->cascadeOnDelete();
            $table->foreignId('usr_id')->constrained('usr')->cascadeOnDelete();
            $table->integer('bulan');
            $table->integer('tahun');
            $table->integer('mtr_bln_lalu');
            $table->integer('mtr_skrg');
            $table->enum('status', ['ditagihkan','pending', 'approved'])->nullable();
            $table->integer('harga_meteran')->nullable();
            $table->integer('harga_sampah')->nullable();
            $table->date('tgl_byr')->nullable();
            $table->string('bkt_byr')->nullable();  
            $table->date('tgl_approved')->nullable();
            $table->integer('nominal')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tagihan_bulanan');
    }
};

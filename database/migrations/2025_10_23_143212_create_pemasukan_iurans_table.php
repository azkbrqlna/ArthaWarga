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
        Schema::create('masuk_iuran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usr_id')->constrained('usr')->cascadeOnDelete();
            $table->foreignId('pengumuman_id')->constrained('pengumuman')->cascadeOnDelete()->nullable();
            $table->foreignId('kat_iuran_id')->constrained('kat_iuran')->cascadeOnDelete()->nullable();
            $table->date('tgl');
            $table->decimal('nominal', 12,2)->nullable();
            $table->string('ket')->nullable();
            $table->string('bkt_byr')->nullable();  
            $table->string('bkt_nota')->nullable();
            $table->date('tgl_byr')->nullable();
            $table->date('tgl_approved')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('masuk_iuran');
    }
};

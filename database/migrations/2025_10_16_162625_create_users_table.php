<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usr', function (Blueprint $table) {
            $table->id(); 
            $table->foreignId('role_id')->constrained('role')->cascadeOnDelete();

            $table->string('email')->unique();
            $table->string('no_kk', 16)->unique();
            $table->string('password');
            $table->string('nm_lengkap');
            $table->string('foto_profil')->nullable();
            $table->string('no_hp');
            $table->text('alamat'); 

            $table->foreignId('kota_id')->nullable()->constrained('kota')->nullOnDelete();
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan')->nullOnDelete();
            $table->foreignId('kelurahan_id')->nullable()->constrained('kelurahan')->nullOnDelete();
            $table->foreignId('rw_id')->nullable()->constrained('rw')->nullOnDelete();
            $table->foreignId('rt_id')->nullable()->constrained('rt')->nullOnDelete();

            $table->string('kode_pos')->nullable(); 
            
            $table->enum('status', ['tetap', 'kontrak'])->default('tetap');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usr');
    }
};
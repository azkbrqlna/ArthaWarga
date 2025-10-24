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
            
            $table->string('kode_prov');
            $table->string('kode_kota_kab');
            $table->string('kode_kec');
            $table->string('kode_desa');

            $table->string('rt_rw');
            $table->string('kode_pos');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usr');
    }
};

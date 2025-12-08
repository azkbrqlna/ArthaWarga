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
        Schema::create('kat_iuran', function (Blueprint $table) {
            $table->id();
            $table->string('nm_kat');
            $table->integer('harga_meteran')->nullable();
            $table->integer('abonemen')->nullable();
            $table->integer('jimpitan_air')->nullable();
            $table->integer('harga_sampah')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kat_iuran');
    }
};

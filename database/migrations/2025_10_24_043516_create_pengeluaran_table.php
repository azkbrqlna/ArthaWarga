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
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->id();
            $table->enum('tipe', ['bop', 'iuran']);
            $table->foreignId('keg_id')->constrained('keg')->cascadeOnDelete();
            $table->date('tgl');
            $table->integer('nominal');
            $table->string('ket');
            $table->string('bkt_nota')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran');
    }
};

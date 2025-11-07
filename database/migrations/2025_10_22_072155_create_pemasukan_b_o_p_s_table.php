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
        Schema::create('masuk_bop', function (Blueprint $table) {
            $table->id();
            $table->date('tgl');
            $table->integer('nominal');
            $table->text('ket');
            $table->string('bkt_nota');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('masuk_bop');
    }
};

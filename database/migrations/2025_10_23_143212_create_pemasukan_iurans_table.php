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
            $table->foreignId('kat_iuran_id')->constrained('kat_iuran')->cascadeOnDelete();
            $table->date('tgl');
            $table->decimal('nominal', 12,2);
            $table->text('ket');
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

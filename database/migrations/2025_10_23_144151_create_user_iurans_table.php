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
        Schema::create('usr_iuran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usr_id')->constrained('usr')->cascadeOnDelete();
            $table->foreignId('masuk_iuran_id')->constrained('masuk_iuran')->cascadeOnDelete();
            $table->date('tgl')->nullable();
            $table->string('bkt_byr')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usr_iuran');
    }
};

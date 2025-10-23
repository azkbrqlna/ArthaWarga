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
        Schema::create('subkat_keg', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kat_keg_id')->constrained('kat_keg', 'id')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('keg_id')->nullable()->constrained('keg', 'id')->  cascadeOnUpdate()->nullOnDelete();
            $table->string('nm_subkat');
            $table->text('ket')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subkat_keg');
    }
};

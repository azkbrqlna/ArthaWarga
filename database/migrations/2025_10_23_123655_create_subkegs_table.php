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
        Schema::create('subkeg', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keg_id')->constrained('keg')->cascadeOnDelete();
            $table->string('nm_subkeg');
            $table->text('keg')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subkeg');
    }
};

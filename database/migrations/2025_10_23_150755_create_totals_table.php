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
        Schema::create('total', function (Blueprint $table) {
            $table->id('total_id');
            $table->foreignId('masuk_iuran_id')->nullable()->constrained('masuk_iuran')->nullOnDelete();
            $table->foreignId('masuk_bop_id')->nullable()->constrained('masuk_bop')->nullOnDelete();
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('total');
    }
};

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
        Schema::table('masuk_iuran', function (Blueprint $table) {
            $table->foreignId('usr_id')->nullable()->constrained('usr')->cascadeOnDelete()->after('id');
            
            $table->enum('status', ['tagihan', 'pending', 'approved'])->default('approved')->after('ket');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('masuk_iuran', function (Blueprint $table) {
            $table->dropForeign(['usr_id']);
            $table->dropColumn('usr_id');
            $table->dropColumn('status');
        });
    }
};
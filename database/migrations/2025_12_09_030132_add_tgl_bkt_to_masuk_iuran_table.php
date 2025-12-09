<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations (Menambahkan kolom).
     */
    public function up(): void
    {
        Schema::table('masuk_iuran', function (Blueprint $table) {
            // Menambahkan kolom bkt_byr dan tgl_byr yang dibutuhkan 
            // oleh MasukIuranController (untuk upload bukti bayar).
            $table->string('bkt_byr')->nullable()->after('status');
            $table->timestamp('tgl_byr')->nullable()->after('bkt_byr');
        });
    }

    /**
     * Reverse the migrations (Menghapus kolom).
     */
    public function down(): void
    {
        Schema::table('masuk_iuran', function (Blueprint $table) {
            // Menghapus kolom yang ditambahkan di fungsi up()
            $table->dropColumn('tgl_byr');
            $table->dropColumn('bkt_byr');
        });
    }
};
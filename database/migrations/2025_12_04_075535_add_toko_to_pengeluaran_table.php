<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Cek dulu, kalau tabel 'usr' BELUM ada, baru buat.
        if (!Schema::hasTable('usr')) {
            Schema::create('usr', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('role_id');
                // ... (kode asli kamu lainnya biarkan saja di dalam sini) ...
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengeluaran', function (Blueprint $table) {
            // ⚠️ TAMBAHAN PENTING:
            // Perintah ini menghapus kolom 'toko' kalau kamu melakukan rollback
            $table->dropColumn('toko');
        });
    }
};
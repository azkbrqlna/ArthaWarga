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
        // Cek dulu: Kalau kolom 'keg_id' BELUM ADA, baru buat.
        if (!Schema::hasColumn('pengeluaran', 'keg_id')) {
            Schema::table('pengeluaran', function (Blueprint $table) {
                $table->unsignedBigInteger('keg_id')->nullable()->after('id');
            });
        }
    }

    public function down()
    {
        Schema::table('pengeluaran', function (Blueprint $table) {
            $table->dropColumn('keg_id');
        });
    }
};
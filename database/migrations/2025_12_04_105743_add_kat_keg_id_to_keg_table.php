<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('keg', 'kat_keg_id')) {
            Schema::table('keg', function (Blueprint $table) {
                // Menambahkan kolom untuk menyimpan ID Kategori
                // ditaruh setelah nm_keg biar rapi
                $table->unsignedBigInteger('kat_keg_id')->nullable()->after('nm_keg');
            });
        }
    }

    public function down()
    {
        Schema::table('keg', function (Blueprint $table) {
            $table->dropColumn('kat_keg_id');
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Tambah Kolom Baru (Kategori & Rincian)
        Schema::table('keg', function (Blueprint $table) {
            if (!Schema::hasColumn('keg', 'kat_keg_id')) {
                $table->unsignedBigInteger('kat_keg_id')->nullable()->after('nm_keg');
            }
            
            if (!Schema::hasColumn('keg', 'rincian_kegiatan')) {
                $table->text('rincian_kegiatan')->nullable()->after('kat_keg_id');
            }
        });

        // 2. UBAH DOKUMEN MENJADI JSON (SUPPORT BANYAK FILE)
        Schema::table('keg', function (Blueprint $table) {
            // Kita drop dulu kolom lama biar bersih
            if (Schema::hasColumn('keg', 'dok_keg')) {
                $table->dropColumn('dok_keg');
            }
        });
        
        Schema::table('keg', function (Blueprint $table) {
            // Buat ulang sebagai JSON
            $table->json('dok_keg')->nullable()->after('panitia');
        });
    }

    public function down()
    {
        Schema::table('keg', function (Blueprint $table) {
            if (Schema::hasColumn('keg', 'kat_keg_id')) {
                $table->dropColumn('kat_keg_id');
            }
            if (Schema::hasColumn('keg', 'rincian_kegiatan')) {
                $table->dropColumn('rincian_kegiatan');
            }
            if (Schema::hasColumn('keg', 'dok_keg')) {
                $table->dropColumn('dok_keg');
            }
        });
    }
};
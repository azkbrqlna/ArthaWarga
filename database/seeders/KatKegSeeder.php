<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\KategoriKegiatan;

class KatKegSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
    {
        $katkegs = [
            [
                'nm_kat' => 'Administrasi',
            ],
            [
                'nm_kat' => 'Kegiatan Sosial dan Pemberdayaan',
            ],
            [
                'nm_kat' => 'Kebersihan dan Pembangunan Lingkungan',
            ],
        ];

        foreach ($katkegs as $katkeg) {
            KategoriKegiatan::updateOrCreate(['nm_kat' => $katkeg['nm_kat']], $katkeg);
        }

    }
}


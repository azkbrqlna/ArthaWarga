<?php

namespace Database\Seeders;

use App\Models\KategoriIuran;
use Illuminate\Database\Seeder;

class KatIuranSeeder extends Seeder
{
    public function run(): void
    {
        $kat_iurans = [
            ['nm_kat' => 'Air'],
            ['nm_kat' => 'Kebersihan'],
            ['nm_kat' => 'Gizi'],
            ['nm_kat' => 'Sosial/Kematian'],
            ['nm_kat' => 'Kas'],
            ['nm_kat' => 'Keamanan'],
            ['nm_kat' => 'Kegiatan'],
            ['nm_kat' => 'Lingkungan'],
            ['nm_kat' => 'Pembangunan'],
        ];

        foreach ($kat_iurans as $kat_iuran) {
            KategoriIuran::updateOrCreate($kat_iuran);
        }
    }
}

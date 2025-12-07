<?php

namespace Database\Seeders;

use App\Models\KategoriIuran;
use Illuminate\Database\Seeder;

class KatIuranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kat_iurans_data = [
            [
                'nm_kat' => 'Air',
                'harga_meteran' => 1000,     
                'abonemen' => 25000,         
                'jimpitan_air' => 10,        
                'harga_sampah' => null,
            ],
            //Kategori Kebersihan (Sampah)
            [
                'nm_kat' => 'Kebersihan',
                'harga_meteran' => null,
                'abonemen' => null,
                'jimpitan_air' => null,
                'harga_sampah' => 20000,     
            ],
            
            ['nm_kat' => 'Gizi'],
            ['nm_kat' => 'Sosial/Kematian'],
            ['nm_kat' => 'Kas'],
            ['nm_kat' => 'Keamanan'],
            ['nm_kat' => 'Kegiatan'],
            ['nm_kat' => 'Lingkungan'],
            ['nm_kat' => 'Pembangunan'],
        ];

        foreach ($kat_iurans_data as $kat_iuran) {
            $default_values = [
                'harga_meteran' => $kat_iuran['harga_meteran'] ?? null,
                'abonemen' => $kat_iuran['abonemen'] ?? null,
                'jimpitan_air' => $kat_iuran['jimpitan_air'] ?? null,
                'harga_sampah' => $kat_iuran['harga_sampah'] ?? null,
            ];

            KategoriIuran::updateOrCreate(
                ['nm_kat' => $kat_iuran['nm_kat']], 
                array_merge($kat_iuran, $default_values) 
            );
        }
    }
}
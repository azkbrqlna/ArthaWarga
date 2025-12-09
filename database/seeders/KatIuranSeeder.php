<?php

namespace Database\Seeders;

use App\Models\KategoriIuran;
use App\Models\HargaIuran; 
use Illuminate\Database\Seeder;

class KatIuranSeeder extends Seeder
{
    public function run(): void
    {
        $kat_iurans_data = [
            'Air' => [
                'config' => [
                    'harga_meteran' => null,
                    'abonemen' => null,
                    'jimpitan_air' => null,
                    'harga_sampah' => null,
                ]
            ],
            'Kebersihan' => [
                'config' => [
                    'harga_meteran' => null,
                    'abonemen' => null,
                    'jimpitan_air' => null,
                    'harga_sampah' => null,
                ]
            ],
            'Gizi' => [], 'Sosial/Kematian' => [], 'Kas' => [],
            'Keamanan' => [], 'Kegiatan' => [], 'Lingkungan' => [], 'Pembangunan' => [],
        ];

        foreach ($kat_iurans_data as $nm_kat => $data) {
            

            $kategori = KategoriIuran::updateOrCreate(
                ['nm_kat' => $nm_kat], 
                ['nm_kat' => $nm_kat]
            );

            $config_data = $data['config'] ?? [
                'harga_meteran' => null,
                'abonemen' => null,
                'jimpitan_air' => null,
                'harga_sampah' => null,
            ];

            HargaIuran::updateOrCreate(
                ['kat_iuran_id' => $kategori->id],
                array_merge($config_data, ['kat_iuran_id' => $kategori->id]) 
            );
        }
    }
}
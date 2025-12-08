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
            // 1. Kategori AIR (Master Data Utama)
            // Ini memuat semua komponen harga yang akan disnapshot ke tagihan bulanan
            [
                'nm_kat'        => 'Air',
                'harga_meteran' => 2000,   // Rp 2.000 per meter kubik
                'abonemen'      => 5000,   // Biaya admin/abonemen tetap
                'jimpitan_air'  => 500,    // Masuk ke kas RT
                'harga_sampah'  => 15000,  // Opsi jika warga ingin bayar sampah sekalian
            ],
            
            // 2. Kategori Lainnya (Harga Null karena biasanya input manual / sukarela)
            ['nm_kat' => 'Kebersihan'], // Opsional, jika ada yg bayar sampah terpisah
            ['nm_kat' => 'Gizi'],
            ['nm_kat' => 'Sosial/Kematian'],
            ['nm_kat' => 'Kas'],
            ['nm_kat' => 'Keamanan'],
            ['nm_kat' => 'Kegiatan'],
            ['nm_kat' => 'Lingkungan'],
            ['nm_kat' => 'Pembangunan'],
            ['nm_kat' => 'Sumbangan Agustusan'],
        ];

        foreach ($kat_iurans_data as $data) {
            // Default value null jika tidak didefinisikan di array atas
            $values = [
                'harga_meteran' => $data['harga_meteran'] ?? null,
                'abonemen'      => $data['abonemen'] ?? null,
                'jimpitan_air'  => $data['jimpitan_air'] ?? null,
                'harga_sampah'  => $data['harga_sampah'] ?? null,
            ];

            KategoriIuran::updateOrCreate(
                ['nm_kat' => $data['nm_kat']], // Cek berdasarkan nama
                $values                        // Update nilai harga
            );
        }
    }
}
<?php

namespace Database\Seeders;

use App\Models\KategoriIuran;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB; // 💡 Import DB Facade

class KatIuranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. DAFTAR KATEGORI YANG INGIN KITA PERTAHANKAN
        $kat_iurans_data = [
            [
                'nm_kat'        => 'Air',
                'harga_meteran' => 2000,
                'abonemen'      => 5000,
                'jimpitan_air'  => 500,
                'harga_sampah'  => 15000,
            ],
            // 💡 HANYA 8 KATEGORI YANG DIINGINKAN (Gizi, Sosial, Kas, Keamanan, Kegiatan, Lingkungan, Pembangunan, Kebersihan)
            ['nm_kat' => 'Kebersihan'],
            ['nm_kat' => 'Gizi'],
            ['nm_kat' => 'Sosial/Kematian'],
            ['nm_kat' => 'Kas'],
            ['nm_kat' => 'Keamanan'],
            ['nm_kat' => 'Kegiatan'],
            ['nm_kat' => 'Lingkungan'],
            ['nm_kat' => 'Pembangunan'],
        ];

        // 2. AMBIL SEMUA NAMA KATEGORI YANG HARUS ADA
        $allowed_names = array_column($kat_iurans_data, 'nm_kat');

        // 🛑 LANGKAH PENTING: HAPUS SEMUA KATEGORI YANG TIDAK ADA DI DAFTAR BARU
        // Pastikan KategoriIuran tidak memiliki relasi yang menghalangi penghapusan
        DB::table('kat_iuran')
            ->whereNotIn('nm_kat', $allowed_names)
            ->delete();

        // 3. UPDATE/CREATE data baru
        foreach ($kat_iurans_data as $data) {
            $values = [
                'harga_meteran' => $data['harga_meteran'] ?? null,
                'abonemen'      => $data['abonemen'] ?? null,
                'jimpitan_air'  => $data['jimpitan_air'] ?? null,
                'harga_sampah'  => $data['harga_sampah'] ?? null,
            ];

            KategoriIuran::updateOrCreate(
                ['nm_kat' => $data['nm_kat']], 
                $values
            );
        }
    }
}
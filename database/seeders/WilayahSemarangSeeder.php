<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kota;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use App\Models\Rw;
use App\Models\Rt;

class WilayahSemarangSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kota Semarang
        $kota = Kota::firstOrCreate(['nama_kota' => 'Kota Semarang']);

        // Data Kecamatan dan Kelurahan (Real Data)
        // Dikelompokkan berdasarkan Request User (Pusat, Utara, Timur, Barat, Selatan)
        
        $dataWilayah = [
            // === WILAYAH SEMARANG PUSAT ===
            'Semarang Tengah' => ['Pendrikan Kidul', 'Sekayu', 'Miroto', 'Brumbungan', 'Jagalan'],
            'Semarang Selatan' => ['Mugassari', 'Pleburan', 'Wonodri', 'Randusari', 'Barusari'],
            'Gajahmungkur' => ['Bendan Duwur', 'Sampangan', 'Petompon', 'Gajahmungkur', 'Lempongsari'],
            'Candisari' => ['Jatingaleh', 'Karanganyar Gunung', 'Tegalsari', 'Candi', 'Kaliwiru'],
            
            // === WILAYAH SEMARANG UTARA ===
            'Semarang Utara' => ['Tanjung Mas', 'Dadapsari', 'Bandarharjo', 'Panggung Kidul', 'Purwosari'],
            'Semarang Timur' => ['Karangturi', 'Sarirejo', 'Kebonagung', 'Rejosari', 'Bugangan'], // Masuk sini
            'Gayamsari' => ['Gayamsari', 'Kaligawe', 'Sambirejo', 'Sawahbesar', 'Siwalan'],
            'Genuk' => ['Genuksari', 'Gebangsari', 'Muktiharjo Lor', 'Bangetayu Kulon', 'Terboyo Wetan'],

            // === WILAYAH SEMARANG TIMUR ===
            'Pedurungan' => ['Pedurungan Kidul', 'Tlogosari Kulon', 'Muktiharjo Kidul', 'Gemah', 'Tlogomulyo'],
            // Gayamsari & Genuk sudah di-cover di atas (administratif tidak bisa double)

            // === WILAYAH SEMARANG BARAT ===
            'Semarang Barat' => ['Krobokan', 'Tawangsari', 'Manyaran', 'Gisikdrono', 'Kalibanteng Kulon'],
            'Ngaliyan' => ['Ngaliyan', 'Tambakaji', 'Bringin', 'Kalipancur', 'Podorejo'],
            'Mijen' => ['Mijen', 'Jatisari', 'Wonolopo', 'Kedungpani', 'Pesantren'],
            'Tugu' => ['Jerakah', 'Tugurejo', 'Mangkang Kulon', 'Mangkang Wetan', 'Randugarut'],

            // === WILAYAH SEMARANG SELATAN ===
            'Banyumanik' => ['Srondol Wetan', 'Banyumanik', 'Pudakpayung', 'Gedawang', 'Jabungan'],
            'Gunungpati' => ['Gunungpati', 'Sekaran', 'Sadeng', 'Sukorejo', 'Cepoko'],
            'Tembalang' => ['Tembalang', 'Bulusan', 'Meteseh', 'Sendangmulyo', 'Kramas'],
        ];

        // LOGIKA LOOPING
        foreach ($dataWilayah as $namaKecamatan => $daftarKelurahan) {
            
            // 2. Buat Kecamatan
            $kecamatan = Kecamatan::firstOrCreate([
                'kota_id' => $kota->id,
                'nama_kecamatan' => $namaKecamatan
            ]);

            foreach ($daftarKelurahan as $namaKelurahan) {
                // 3. Buat Kelurahan (Min 3 per Kec)
                $kelurahan = Kelurahan::firstOrCreate([
                    'kecamatan_id' => $kecamatan->id,
                    'nama_kelurahan' => $namaKelurahan
                ]);
            }
        }
    }
}
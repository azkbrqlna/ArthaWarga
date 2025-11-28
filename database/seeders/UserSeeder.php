<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Kota;
use App\Models\Rt;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // 1. === CEK & BUAT ROLE ===
        if (Role::count() === 0) {
            $this->call(RoleSeeder::class);
        }

        $superadminRole = Role::where('nm_role', 'Superadmin')->first()->id ?? 1;
        $ketuaRtRole    = Role::where('nm_role', 'Ketua RT')->first()->id ?? 2;
        $sekretarisRole = Role::where('nm_role', 'Sekretaris')->first()->id ?? 3;
        $bendaharaRole  = Role::where('nm_role', 'Bendahara')->first()->id ?? 4;
        $wargaRole      = Role::where('nm_role', 'Warga')->first()->id ?? 5;

        // 2. === AMBIL DATA KOTA SEMARANG (YANG SUDAH DIBUAT WILAYAH SEEDER) ===
        $kota = Kota::where('nama_kota', 'Kota Semarang')->first();

        // Safety Check: Kalau WilayahSemarangSeeder belum dijalankan, jalankan dulu
        if (!$kota) {
            $this->call(WilayahSemarangSeeder::class);
            $kota = Kota::where('nama_kota', 'Kota Semarang')->first();
        }

        // 3. === AMBIL SATU LOKASI SPESIFIK UNTUK SUPERADMIN ===
        // Kita ambil salah satu RT secara acak dari Kota Semarang untuk dijadikan alamat admin
        // Logika: Kota -> Kecamatan -> Kelurahan -> RW -> RT
        $rtAdmin = Rt::with('rw.kelurahan.kecamatan.kota')
                    ->whereHas('rw.kelurahan.kecamatan.kota', function($q) use ($kota) {
                        $q->where('id', $kota->id);
                    })
                    ->inRandomOrder()
                    ->first();

        // Simpan ID lokasi Admin biar gampang
        $locAdmin = [
            'kota_id'      => $kota->id,
            'kecamatan_id' => $rtAdmin->rw->kelurahan->kecamatan->id,
            'kelurahan_id' => $rtAdmin->rw->kelurahan->id,
            'rw_id'        => $rtAdmin->rw->id,
            'rt_id'        => $rtAdmin->id,
        ];

        // 4. === INSERT SUPERADMIN ===
        DB::table('usr')->insert([
            'role_id'      => $superadminRole,
            'email'        => 'superadmin@semarang.go.id',
            'no_kk'        => '3374100000000001',
            'password'     => Hash::make('password123'),
            'nm_lengkap'   => 'Super Admin Semarang',
            'foto_profil'  => null,
            'no_hp'        => '081234567890',
            'status'       => 'tetap',
            'alamat'       => 'Jl. Pemuda No. 1', 
            'kode_pos'     => '50132',

            // Masukkan lokasi yang diambil tadi
            'kota_id'      => $locAdmin['kota_id'],
            'kecamatan_id' => $locAdmin['kecamatan_id'],
            'kelurahan_id' => $locAdmin['kelurahan_id'],
            'rw_id'        => $locAdmin['rw_id'],
            'rt_id'        => $locAdmin['rt_id'],

            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // 5. === HELPER FUNCTION USER RANDOM (Updated) ===
        // Fungsi ini akan mengambil RT acak SETIAP KALI user dibuat
        $buatUser = function ($roleId, $emailPrefix) use ($faker, $kota) {
            
            // Ambil RT acak di Semarang
            $rtRandom = Rt::with('rw.kelurahan.kecamatan')
                        ->whereHas('rw.kelurahan.kecamatan', function($q) use ($kota) {
                            $q->where('kota_id', $kota->id);
                        })
                        ->inRandomOrder()
                        ->first();

            return [
                'role_id'      => $roleId,
                'email'        => strtolower($emailPrefix) . '@example.com',
                'no_kk'        => $faker->unique()->numerify('3374##########'), // Kode KK Semarang 3374
                'password'     => Hash::make('password123'),
                'nm_lengkap'   => $faker->name(),
                'foto_profil'  => null,
                'no_hp'        => '08' . $faker->numerify('##########'),
                'status'       => $faker->randomElement(['tetap', 'kontrak']),
                'alamat'       => $faker->streetAddress(),
                'kode_pos'     => $faker->postcode(),

                // Isi ID Wilayah sesuai RT yang terambil acak tadi
                'kota_id'      => $kota->id,
                'kecamatan_id' => $rtRandom->rw->kelurahan->kecamatan->id,
                'kelurahan_id' => $rtRandom->rw->kelurahan->id,
                'rw_id'        => $rtRandom->rw->id,
                'rt_id'        => $rtRandom->id,

                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        };

        // 6. === INSERT DATA PENGURUS ===
        DB::table('usr')->insert($buatUser($ketuaRtRole, 'ketua_rt'));
        DB::table('usr')->insert($buatUser($sekretarisRole, 'sekretaris'));
        DB::table('usr')->insert($buatUser($bendaharaRole, 'bendahara'));

        // 7. === INSERT 10 WARGA RANDOM ===
        for ($i = 1; $i <= 10; $i++) {
            DB::table('usr')->insert($buatUser($wargaRole, 'warga' . $i));
        }
    }
}
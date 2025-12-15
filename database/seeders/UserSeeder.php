<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Kota;
use App\Models\Kelurahan; // Kita berhenti di Kelurahan, tidak pakai RT/RW Model lagi
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
        $bendaharaRole  = Role::where('nm_role', 'Bendahara')->first()->id ?? 3;
        $sekretarisRole = Role::where('nm_role', 'Sekretaris')->first()->id ?? 4;
        $wargaRole      = Role::where('nm_role', 'Warga')->first()->id ?? 5;

        // 2. === AMBIL DATA KOTA SEMARANG ===
        $kota = Kota::where('nama_kota', 'Kota Semarang')->first();

        // Safety Check: Kalau WilayahSemarangSeeder belum dijalankan
        if (!$kota) {
            $this->call(WilayahSemarangSeeder::class);
            $kota = Kota::where('nama_kota', 'Kota Semarang')->first();
        }

        // 3. === AMBIL SATU KELURAHAN ACAK UNTUK ADMIN ===
        // Kita cari kelurahan yang ada di Kota Semarang
        $kelurahanAdmin = Kelurahan::with('kecamatan.kota')
                            ->whereHas('kecamatan', function($q) use ($kota) {
                                $q->where('kota_id', $kota->id);
                            })
                            ->inRandomOrder()
                            ->first();

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

            // ID Wilayah (Dari Database)
            'kota_id'      => $kota->id,
            'kecamatan_id' => $kelurahanAdmin->kecamatan->id,
            'kelurahan_id' => $kelurahanAdmin->id,

            // String Wilayah (Manual Angka)
            'rw'           => '001', 
            'rt'           => '001',

            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // 5. === HELPER FUNCTION USER RANDOM ===
        $buatUser = function ($roleId, $emailPrefix) use ($faker, $kota) {
            
            // Ambil Kelurahan acak di Semarang
            $kelRandom = Kelurahan::with('kecamatan')
                        ->whereHas('kecamatan', function($q) use ($kota) {
                            $q->where('kota_id', $kota->id);
                        })
                        ->inRandomOrder()
                        ->first();

            // Generate Angka RT/RW String (001 - 020)
            $rwRandom = str_pad($faker->numberBetween(1, 20), 3, '0', STR_PAD_LEFT);
            $rtRandom = str_pad($faker->numberBetween(1, 20), 3, '0', STR_PAD_LEFT);

            return [
                'role_id'      => $roleId,
                'email'        => strtolower($emailPrefix) . '@example.com',
                'no_kk'        => $faker->unique()->numerify('3374############'),
                'password'     => Hash::make('password123'),
                'nm_lengkap'   => $faker->name(),
                'foto_profil'  => null,
                'no_hp'        => '08' . $faker->numerify('##########'),
                'status'       => $faker->randomElement(['tetap', 'kontrak']),
                'alamat'       => $faker->streetAddress(),
                'kode_pos'     => $faker->postcode(),

                // Isi ID Wilayah Database
                'kota_id'      => $kota->id,
                'kecamatan_id' => $kelRandom->kecamatan->id,
                'kelurahan_id' => $kelRandom->id,

                // Isi String Wilayah Manual
                'rw'           => $rwRandom,
                'rt'           => $rtRandom,

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
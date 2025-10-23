<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID'); 

        if (Role::count() === 0) {
            $this->call(RoleSeeder::class);
        }

        // Ambil ID role
        $superadminRole = Role::where('nm_role', 'Superadmin')->first()->id ?? 1;
        $ketuaRtRole = Role::where('nm_role', 'Ketua RT')->first()->id ?? 2;
        $sekretarisRole = Role::where('nm_role', 'Sekretaris')->first()->id ?? 3;
        $bendaharaRole = Role::where('nm_role', 'Bendahara')->first()->id ?? 4;
        $wargaRole = Role::where('nm_role', 'Warga')->first()->id ?? 5;

        // Superadmin
        DB::table('usr')->insert([
            'role_id' => $superadminRole,
            'email' => 'superadmin@desa.go.id',
            'no_kk' => '3174091005000001',
            'password' => Hash::make('password123'),
            'nm_lengkap' => 'Super Admin Desa',
            'foto_profil' => null,
            'no_hp' => '081234567890',
            'kode_prov' => '31',
            'kode_kota_kab' => '31.74',
            'kode_kec' => '31.74.09',
            'kode_desa' => '31.74.09.1005',
            'rt_rw' => '01/02',
            'kode_pos' => '12120',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Buat array helper untuk data acak
        $kodeWilayah = [
            'kode_prov' => '31',
            'kode_kota_kab' => '31.74',
            'kode_kec' => '31.74.09',
            'kode_desa' => '31.74.09.1005',
            'rt_rw' => '01/02',
            'kode_pos' => '12120',
        ];

        // Fungsi pembuat user random
        $buatUser = function ($roleId, $namaRole) use ($faker, $kodeWilayah) {
            return [
                'role_id' => $roleId,
                'email' => strtolower(str_replace(' ', '', $namaRole)) . '@example.com',
                'no_kk' => $faker->unique()->numerify('317409##########'),
                'password' => Hash::make('password123'),
                'nm_lengkap' => $faker->name(),
                'foto_profil' => null,
                'no_hp' => '08' . $faker->numerify('##########'),
                ...$kodeWilayah,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        };

        // Tambahkan masing-masing role
        DB::table('usr')->insert($buatUser($ketuaRtRole, 'Ketua RT'));
        DB::table('usr')->insert($buatUser($sekretarisRole, 'Sekretaris'));
        DB::table('usr')->insert($buatUser($bendaharaRole, 'Bendahara'));

        // Tambahkan 3 warga random
        for ($i = 1; $i <= 3; $i++) {
            DB::table('usr')->insert($buatUser($wargaRole, 'Warga' . $i));
        }
    }
}

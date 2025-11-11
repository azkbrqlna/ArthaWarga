<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Pastikan role sudah ada
        if (Role::count() === 0) {
            $this->call(RoleSeeder::class);
        }

        // Ambil ID role (fallback ke angka default jika belum ada)
        $superadminRole = Role::where('nm_role', 'Superadmin')->first()->id ?? 1;
        $ketuaRtRole = Role::where('nm_role', 'Ketua RT')->first()->id ?? 2;
        $sekretarisRole = Role::where('nm_role', 'Sekretaris')->first()->id ?? 3;
        $bendaharaRole = Role::where('nm_role', 'Bendahara')->first()->id ?? 4;
        $wargaRole = Role::where('nm_role', 'Warga')->first()->id ?? 5;

        // ==== Superadmin ====
        DB::table('usr')->insert([
            'role_id' => $superadminRole,
            'email' => 'superadmin@desa.go.id',
            'no_kk' => '3174091005000001',
            'password' => Hash::make('password123'),
            'nm_lengkap' => 'Super Admin Desa',
            'foto_profil' => null,
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Merdeka No. 1, Jakarta Selatan',
            'rt' => '01',
            'rw' => '02',
            'kode_pos' => '12120',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ==== Helper function untuk user random ====
        $buatUser = function ($roleId, $emailPrefix) use ($faker) {
            return [
                'role_id' => $roleId,
                'email' => strtolower($emailPrefix) . '@example.com',
                'no_kk' => $faker->unique()->numerify('317409##########'),
                'password' => Hash::make('password123'),
                'nm_lengkap' => $faker->name(),
                'foto_profil' => null,
                'no_hp' => '08' . $faker->numerify('##########'),
                'alamat' => $faker->address(),
                'rt' => $faker->numberBetween(1, 10),
                'rw' => $faker->numberBetween(1, 5),
                'kode_pos' => $faker->postcode(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        };

        // ==== Insert data tiap role ====
        DB::table('usr')->insert($buatUser($ketuaRtRole, 'ketua_rt'));
        DB::table('usr')->insert($buatUser($sekretarisRole, 'sekretaris'));
        DB::table('usr')->insert($buatUser($bendaharaRole, 'bendahara'));

        // ==== Tambahkan beberapa warga ====
        for ($i = 1; $i <= 5; $i++) {
            DB::table('usr')->insert($buatUser($wargaRole, 'warga' . $i));
        }
    }
}

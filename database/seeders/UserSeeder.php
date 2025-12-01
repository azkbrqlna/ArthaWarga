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

        // Ambil ID role (fallback ke nilai default jika belum ada)
        $superadminRole = Role::where('nm_role', 'Superadmin')->first()->id ?? 1;
        $ketuaRtRole    = Role::where('nm_role', 'Ketua RT')->first()->id ?? 2;
        $sekretarisRole = Role::where('nm_role', 'Sekretaris')->first()->id ?? 3;
        $bendaharaRole  = Role::where('nm_role', 'Bendahara')->first()->id ?? 4;
        $wargaRole      = Role::where('nm_role', 'Warga')->first()->id ?? 5;

        // === Superadmin utama ===
        DB::table('usr')->insert([
            'nm_lengkap' => 'Super Admin Desa',
            'no_kk'      => '3174091005000001',
            'email'      => 'superadmin@desa.go.id',
            'password'         => Hash::make('password123'),
            'no_hp'      => '081234567890',
            'role_id'    => $superadminRole,
            'status'     => 'tetap', 
            'alamat'     => 'Jl. Merdeka No. 1, Desa Maju',
            'rt'         => '01',
            'rw'         => '02',
            'kode_pos'   => '12120',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // === Fungsi pembuat user acak ===
        $buatUser = function ($roleId, $namaRole) use ($faker) {
            return [
                'nm_lengkap' => $faker->name(),
                'no_kk'      => $faker->unique()->numerify('317409##########'),
                'email'      => strtolower(str_replace(' ', '', $namaRole)) . '@example.com',
                'password'   => Hash::make('password123'),
                'no_hp'      => '08' . $faker->numerify('##########'),
                'role_id'    => $roleId,
                'status'     => $faker->randomElement(['tetap', 'kontrak']), 
                'alamat'     => $faker->address(),
                'rt'         => str_pad($faker->numberBetween(1, 9), 2, '0', STR_PAD_LEFT),
                'rw'         => str_pad($faker->numberBetween(1, 5), 2, '0', STR_PAD_LEFT),
                'kode_pos'   => '12120',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        };

        // Tambahkan masing-masing role utama
        DB::table('usr')->insert($buatUser($ketuaRtRole, 'KetuaRT'));
        DB::table('usr')->insert($buatUser($sekretarisRole, 'Sekretaris'));
        DB::table('usr')->insert($buatUser($bendaharaRole, 'Bendahara'));

        // Tambahkan beberapa warga acak
        for ($i = 1; $i <= 3; $i++) {
            DB::table('usr')->insert($buatUser($wargaRole, 'Warga' . $i));
        }
    }
}

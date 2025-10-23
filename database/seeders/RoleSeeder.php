<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
  
    public function run(): void
    {
        $roles = [
            [
                'nm_role' => 'Superadmin',
                'ket' => 'Memiliki akses penuh ke seluruh sistem dan pengaturan aplikasi.'
            ],
            [
                'nm_role' => 'Ketua RT',
                'ket' => 'Bertanggung jawab atas koordinasi dan pengawasan kegiatan RT.'
            ],
            [
                'nm_role' => 'Bendahara',
                'ket' => 'Mengelola keuangan RT, mencatat pemasukan dan pengeluaran.'
            ],
            [
                'nm_role' => 'Sekretaris',
                'ket' => 'Mengurus administrasi, surat-menyurat, dan dokumentasi RT.'
            ],
            [
                'nm_role' => 'Warga',
                'ket' => 'Anggota masyarakat yang terdaftar di lingkungan RT.'
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['nm_role' => $role['nm_role']], $role);
        }

    }
}

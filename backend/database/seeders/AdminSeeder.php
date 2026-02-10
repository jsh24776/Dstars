<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $name = env('ADMIN_NAME');
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $name || ! $email || ! $password) {
            throw new RuntimeException('Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env');
        }

        Admin::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create super admin user
        User::firstOrCreate(
            ['username' => 'candigitpos'],
            [
                'name' => 'Candigit POS',
                'username' => 'candigitpos',
                'email' => 'candigit.web@gmail.com',
                'password' => Hash::make('@CNDIGITlgoin05'),
                'role' => UserRole::SUPER_ADMIN,
            ]
        );

        // Create admin user
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'email' => 'admin@greenpos.com',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
            ]
        );

        // Create cashier user
        User::firstOrCreate(
            ['username' => 'kasir'],
            [
                'name' => 'Kasir GreenPOS',
                'username' => 'kasir',
                'email' => 'kasir@greenpos.com',
                'password' => Hash::make('password'),
                'role' => UserRole::KASIR,
            ]
        );

        // Create dapur user
        User::firstOrCreate(
            ['username' => 'dapur'],
            [
                'name' => 'Dapur GreenPOS',
                'username' => 'dapur',
                'email' => 'dapur@greenpos.com',
                'password' => Hash::make('password'),
                'role' => UserRole::DAPUR,
            ]
        );
    }
}
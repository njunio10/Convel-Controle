<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $defaultName = env('DEFAULT_ADMIN_NAME', 'Administrador');
        $defaultEmail = env('DEFAULT_ADMIN_EMAIL', 'convel_adminjr123@gmail.com');
        $defaultPassword = env('DEFAULT_ADMIN_PASSWORD', 'convel>suflex123');

        User::firstOrCreate(
            ['email' => $defaultEmail],
            [
                'name' => $defaultName,
                'password' => Hash::make($defaultPassword),
            ]
        );
    }
}

<?php

declare (strict_types = 1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

final class Playground extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var  string
     */
    protected $signature = 'play';

    /**
     * Execute the console command.
     */

    public function handle(): void
    {
        $password = Hash::make('convel>suflex123');
        $this->info($password);
    }
}

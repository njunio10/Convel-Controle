<?php

declare (strict_types = 1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

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
        ds()->clear();
        $response = Http::withHeaders(['access_token' => config('services.asaas.api_key')])->get(config('services.asaas.base_url').'/finance/balance'); 
        ds($response->json());
    }
}

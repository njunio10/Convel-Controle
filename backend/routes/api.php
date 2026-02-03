<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/status', function () {
    return [
        'app' => 'controle-convel',
        'status' => 'rodando'
    ];
});


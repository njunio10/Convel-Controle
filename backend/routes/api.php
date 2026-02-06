<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AsaasController;

Route::get('/status', function () {
    return [
        'app' => 'controle-convel',
        'status' => 'rodando'
    ];
});

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/transactions/summary', [TransactionController::class, 'summary']);
Route::apiResource('transactions', TransactionController::class);
Route::apiResource('clients', ClientController::class);
Route::patch('/leads/{lead}/status', [LeadController::class, 'updateStatus']);
Route::apiResource('leads', LeadController::class);

// Rotas da Asaas - Consulta de Entradas e Saídas
Route::prefix('asaas')->group(function () {
    Route::get('/payments', [AsaasController::class, 'getPayments']);
    Route::get('/payments/{id}', [AsaasController::class, 'getPayment']);
    Route::get('/balance', [AsaasController::class, 'getBalance']);
    Route::get('/financial', [AsaasController::class, 'getFinancial']);
    Route::get('/entries', [AsaasController::class, 'getEntries']);
    Route::get('/outflows', [AsaasController::class, 'getOutflows']);
});
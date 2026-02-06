<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AsaasService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.asaas.api_key');
        $this->baseUrl = config('services.asaas.base_url', 'https://api.asaas.com/v3');
    }

    /**
     * Consulta pagamentos (entradas/recebimentos)
     */
    public function getPayments(array $filters = []): array
    {
        try {
            $response = Http::withHeaders([
                'access_token' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/payments", $filters);

            if ($response->successful()) {
                $json = $response->json();
                // A API da Asaas retorna { "object": "list", "data": [...], ... }
                // ou diretamente um array em alguns casos
                if (isset($json['data']) && is_array($json['data'])) {
                    return $json['data'];
                }
                // Se retornar diretamente um array
                if (is_array($json) && !isset($json['data'])) {
                    return $json;
                }
                return [];
            }

            Log::error('Erro ao consultar pagamentos da Asaas', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('Exceção ao consultar pagamentos da Asaas', [
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Consulta um pagamento específico por ID
     */
    public function getPayment(string $paymentId): ?array
    {
        try {
            $response = Http::withHeaders([
                'access_token' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/payments/{$paymentId}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Exceção ao consultar pagamento da Asaas', [
                'payment_id' => $paymentId,
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Consulta saldo da conta
     */
    public function getBalance(): ?array
    {
        try {
            $response = Http::withHeaders([
                'access_token' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/myAccount");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Exceção ao consultar saldo da Asaas', [
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Consulta financeiro (entradas e saídas)
     */
    public function getFinancial(array $filters = []): array
    {
        try {
            // Busca pagamentos recebidos (entradas)
            $paymentsResponse = $this->getPayments(array_merge($filters, [
                'status' => 'RECEIVED',
            ]));

            // Busca pagamentos pendentes (a receber)
            $pendingResponse = $this->getPayments(array_merge($filters, [
                'status' => 'PENDING',
            ]));

            // Busca pagamentos vencidos (a receber)
            $overdueResponse = $this->getPayments(array_merge($filters, [
                'status' => 'OVERDUE',
            ]));

            $received = is_array($paymentsResponse) ? $paymentsResponse : [];
            $pending = is_array($pendingResponse) ? $pendingResponse : [];
            $overdue = is_array($overdueResponse) ? $overdueResponse : [];

            // Calcula totais
            $totalReceived = array_sum(array_column($received, 'value'));
            $totalPending = array_sum(array_column($pending, 'value'));
            $totalOverdue = array_sum(array_column($overdue, 'value'));

            return [
                'entries' => [
                    'received' => [
                        'data' => $received,
                        'total' => $totalReceived,
                        'count' => count($received),
                    ],
                    'pending' => [
                        'data' => $pending,
                        'total' => $totalPending,
                        'count' => count($pending),
                    ],
                    'overdue' => [
                        'data' => $overdue,
                        'total' => $totalOverdue,
                        'count' => count($overdue),
                    ],
                ],
                'summary' => [
                    'total_received' => $totalReceived,
                    'total_pending' => $totalPending,
                    'total_overdue' => $totalOverdue,
                    'total_expected' => $totalPending + $totalOverdue,
                ],
            ];
        } catch (\Exception $e) {
            Log::error('Exceção ao consultar financeiro da Asaas', [
                'message' => $e->getMessage(),
            ]);

            return [
                'entries' => [
                    'received' => ['data' => [], 'total' => 0, 'count' => 0],
                    'pending' => ['data' => [], 'total' => 0, 'count' => 0],
                    'overdue' => ['data' => [], 'total' => 0, 'count' => 0],
                ],
                'summary' => [
                    'total_received' => 0,
                    'total_pending' => 0,
                    'total_overdue' => 0,
                    'total_expected' => 0,
                ],
                'errors' => [$e->getMessage()],
            ];
        }
    }

    /**
     * Confirma um pagamento no ambiente sandbox
     * Apenas funciona no ambiente sandbox (api-sandbox.asaas.com)
     */
    public function confirmPayment(string $paymentId): ?array
    {
        try {
            // Verifica se está no ambiente sandbox
            if (strpos($this->baseUrl, 'sandbox') === false) {
                Log::warning('Tentativa de confirmar pagamento fora do ambiente sandbox', [
                    'payment_id' => $paymentId,
                    'base_url' => $this->baseUrl,
                ]);
                return null;
            }

            $response = Http::withHeaders([
                'access_token' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$this->baseUrl}/sandbox/payment/{$paymentId}/confirm");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Erro ao confirmar pagamento na Asaas', [
                'payment_id' => $paymentId,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exceção ao confirmar pagamento da Asaas', [
                'payment_id' => $paymentId,
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Verifica se está no ambiente sandbox
     */
    public function isSandbox(): bool
    {
        return strpos($this->baseUrl, 'sandbox') !== false;
    }
}

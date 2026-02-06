<?php

namespace App\Http\Controllers;

use App\Services\AsaasService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AsaasController extends Controller
{
    private AsaasService $asaasService;

    public function __construct(AsaasService $asaasService)
    {
        $this->asaasService = $asaasService;
    }

    /**
     * Consulta pagamentos (entradas/recebimentos)
     */
    public function getPayments(Request $request): JsonResponse
    {
        $filters = [
            'customer' => $request->query('customer'),
            'subscription' => $request->query('subscription'),
            'installment' => $request->query('installment'),
            'status' => $request->query('status'),
            'billingType' => $request->query('billing_type'),
            'paymentDate' => $request->query('payment_date'),
            'paymentDate[ge]' => $request->query('payment_date_from'),
            'paymentDate[le]' => $request->query('payment_date_to'),
            'dueDate[ge]' => $request->query('due_date_from'),
            'dueDate[le]' => $request->query('due_date_to'),
            'offset' => $request->query('offset', 0),
            'limit' => $request->query('limit', 100),
        ];

        // Remove filtros vazios
        $filters = array_filter($filters, fn($value) => $value !== null && $value !== '');

        $result = $this->asaasService->getPayments($filters);

        return response()->json([
            'data' => is_array($result) ? $result : [],
        ]);
    }

    /**
     * Consulta um pagamento específico
     */
    public function getPayment(string $id): JsonResponse
    {
        $payment = $this->asaasService->getPayment($id);

        if ($payment === null) {
            return response()->json([
                'message' => 'Pagamento não encontrado',
            ], 404);
        }

        return response()->json(['data' => $payment]);
    }

    /**
     * Consulta saldo da conta
     */
    public function getBalance(): JsonResponse
    {
        $balance = $this->asaasService->getBalance();

        if ($balance === null) {
            return response()->json([
                'message' => 'Erro ao consultar saldo',
            ], 500);
        }

        return response()->json(['data' => $balance]);
    }

    /**
     * Consulta financeiro completo (entradas e saídas)
     */
    public function getFinancial(Request $request): JsonResponse
    {
        $filters = [
            'paymentDate[ge]' => $request->query('start_date'),
            'paymentDate[le]' => $request->query('end_date'),
            'dueDate[ge]' => $request->query('due_date_from'),
            'dueDate[le]' => $request->query('due_date_to'),
        ];

        // Remove filtros vazios
        $filters = array_filter($filters, fn($value) => $value !== null && $value !== '');

        $result = $this->asaasService->getFinancial($filters);

        return response()->json([
            'data' => $result,
        ], isset($result['errors']) && !empty($result['errors']) ? 400 : 200);
    }

    /**
     * Consulta apenas entradas (recebimentos)
     */
    public function getEntries(Request $request): JsonResponse
    {
        $filters = [
            'status' => 'RECEIVED',
            'paymentDate[ge]' => $request->query('start_date'),
            'paymentDate[le]' => $request->query('end_date'),
            'offset' => $request->query('offset', 0),
            'limit' => $request->query('limit', 100),
        ];

        $filters = array_filter($filters, fn($value) => $value !== null && $value !== '');

        $result = $this->asaasService->getPayments($filters);

        return response()->json([
            'data' => is_array($result) ? $result : [],
        ]);
    }

    /**
     * Consulta apenas saídas (pagamentos a fazer/pendentes)
     */
    public function getOutflows(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status', 'PENDING'),
            'dueDate[ge]' => $request->query('start_date'),
            'dueDate[le]' => $request->query('end_date'),
            'offset' => $request->query('offset', 0),
            'limit' => $request->query('limit', 100),
        ];

        $filters = array_filter($filters, fn($value) => $value !== null && $value !== '');

        $result = $this->asaasService->getPayments($filters);

        return response()->json([
            'data' => is_array($result) ? $result : [],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = $this->applyFilters(Transaction::query(), $request)
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Transaction $transaction) => $this->transform($transaction));

        return response()->json(['data' => $transactions]);
    }

    public function show(Transaction $transaction)
    {
        return response()->json(['data' => $this->transform($transaction)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'type' => ['required', 'in:income,expense'],
            'category' => ['required', 'string', 'max:100'],
            'date' => ['nullable', 'date'],
        ]);

        if (!isset($data['date'])) {
            $data['date'] = now()->toDateString();
        }

        $transaction = Transaction::create($data);

        return response()->json(['data' => $this->transform($transaction)], 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $data = $request->validate([
            'description' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'type' => ['sometimes', 'in:income,expense'],
            'category' => ['sometimes', 'string', 'max:100'],
            'date' => ['sometimes', 'date'],
        ]);

        $transaction->fill($data);
        $transaction->save();

        return response()->json(['data' => $this->transform($transaction)]);
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();

        return response()->noContent();
    }

    public function summary(Request $request)
    {
        $baseQuery = $this->applyFilters(Transaction::query(), $request);
        $income = (clone $baseQuery)->where('type', 'income')->sum('amount');
        $expense = (clone $baseQuery)->where('type', 'expense')->sum('amount');

        return response()->json([
            'data' => [
                'income' => (float) $income,
                'expense' => (float) $expense,
                'balance' => (float) $income - (float) $expense,
            ],
        ]);
    }

    private function applyFilters($query, Request $request)
    {
        $type = $request->query('type');
        if (in_array($type, ['income', 'expense'], true)) {
            $query->where('type', $type);
        }

        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif ($startDate) {
            $query->whereDate('date', '>=', $startDate);
        } elseif ($endDate) {
            $query->whereDate('date', '<=', $endDate);
        }

        return $query;
    }

    private function transform(Transaction $transaction): array
    {
        return [
            'id' => (string) $transaction->id,
            'description' => $transaction->description,
            'amount' => (float) $transaction->amount,
            'type' => $transaction->type,
            'category' => $transaction->category,
            'date' => optional($transaction->date)->toDateString(),
            'createdAt' => optional($transaction->created_at)->toIso8601String(),
        ];
    }
}

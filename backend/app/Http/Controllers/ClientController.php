<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Client $client) => $this->transform($client));

        return response()->json(['data' => $clients]);
    }

    public function show(Client $client)
    {
        return response()->json(['data' => $this->transform($client)]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request, true);
        $client = Client::create($data);

        return response()->json(['data' => $this->transform($client)], 201);
    }

    public function update(Request $request, Client $client)
    {
        $data = $this->validatedData($request, false);

        $client->fill($data);
        $client->save();

        return response()->json(['data' => $this->transform($client)]);
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return response()->noContent();
    }

    private function validatedData(Request $request, bool $isCreate): array
    {
        $presence = $isCreate ? 'required' : 'sometimes';

        $responsibleRule = $isCreate
            ? ['required_without:responsible_name', 'string', 'max:255']
            : ['sometimes', 'string', 'max:255'];
        $responsibleSnakeRule = $isCreate
            ? ['required_without:responsibleName', 'string', 'max:255']
            : ['sometimes', 'string', 'max:255'];
        $monthlyRule = $isCreate
            ? ['required_without:monthly_fee', 'numeric', 'min:0']
            : ['sometimes', 'numeric', 'min:0'];
        $monthlySnakeRule = $isCreate
            ? ['required_without:monthlyFee', 'numeric', 'min:0']
            : ['sometimes', 'numeric', 'min:0'];

        $data = $request->validate([
            'name' => [$presence, 'string', 'max:255'],
            'responsibleName' => $responsibleRule,
            'responsible_name' => $responsibleSnakeRule,
            'email' => [$presence, 'email', 'max:255'],
            'phone' => [$presence, 'string', 'max:50'],
            'origin' => [$presence, 'in:promocao,indicacao,evento,redes_sociais,site,outro'],
            'referredBy' => [$isCreate ? 'nullable' : 'sometimes', 'nullable', 'string', 'max:255'],
            'referred_by' => [$isCreate ? 'nullable' : 'sometimes', 'nullable', 'string', 'max:255'],
            'monthlyFee' => $monthlyRule,
            'monthly_fee' => $monthlySnakeRule,
            'notes' => [$isCreate ? 'nullable' : 'sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        if (array_key_exists('responsibleName', $data)) {
            $data['responsible_name'] = $data['responsibleName'];
            unset($data['responsibleName']);
        }

        if (array_key_exists('referredBy', $data)) {
            $data['referred_by'] = $data['referredBy'];
            unset($data['referredBy']);
        }

        if (array_key_exists('monthlyFee', $data)) {
            $data['monthly_fee'] = $data['monthlyFee'];
            unset($data['monthlyFee']);
        }

        if (array_key_exists('origin', $data) && $data['origin'] !== 'indicacao') {
            $data['referred_by'] = null;
        }

        return $data;
    }

    private function transform(Client $client): array
    {
        return [
            'id' => (string) $client->id,
            'name' => $client->name,
            'responsibleName' => $client->responsible_name,
            'email' => $client->email,
            'phone' => $client->phone,
            'origin' => $client->origin,
            'referredBy' => $client->referred_by,
            'monthlyFee' => $client->monthly_fee !== null ? (float) $client->monthly_fee : null,
            'notes' => $client->notes,
            'createdAt' => optional($client->created_at)->toIso8601String(),
        ];
    }
}

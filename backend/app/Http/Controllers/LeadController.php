<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function index()
    {
        $leads = Lead::query()
            ->orderByDesc('updated_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Lead $lead) => $this->transform($lead));

        return response()->json(['data' => $leads]);
    }

    public function show(Lead $lead)
    {
        return response()->json(['data' => $this->transform($lead)]);
    }

    public function store(Request $request)
    {
        $data = $this->validatedData($request, true);
        $data['status'] = $data['status'] ?? 'novo';

        $lead = Lead::create($data);

        return response()->json(['data' => $this->transform($lead)], 201);
    }

    public function update(Request $request, Lead $lead)
    {
        $data = $this->validatedData($request, false);

        $lead->fill($data);
        $lead->save();

        return response()->json(['data' => $this->transform($lead)]);
    }

    public function updateStatus(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'status' => ['required', 'in:novo,em_contato,convertido,perdido'],
        ]);

        $lead->status = $data['status'];
        $lead->save();

        return response()->json(['data' => $this->transform($lead)]);
    }

    public function destroy(Lead $lead)
    {
        $lead->delete();

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

        $data = $request->validate([
            'name' => [$presence, 'string', 'max:255'],
            'responsibleName' => $responsibleRule,
            'responsible_name' => $responsibleSnakeRule,
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => [$presence, 'string', 'max:50'],
            'origin' => [$presence, 'in:promocao,indicacao,evento,redes_sociais,site,outro'],
            'referredBy' => [$isCreate ? 'nullable' : 'sometimes', 'nullable', 'string', 'max:255'],
            'referred_by' => [$isCreate ? 'nullable' : 'sometimes', 'nullable', 'string', 'max:255'],
            'status' => [$isCreate ? 'nullable' : 'sometimes', 'in:novo,em_contato,convertido,perdido'],
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

        if (array_key_exists('origin', $data) && $data['origin'] !== 'indicacao') {
            $data['referred_by'] = null;
        }

        return $data;
    }

    private function transform(Lead $lead): array
    {
        return [
            'id' => (string) $lead->id,
            'name' => $lead->name,
            'responsibleName' => $lead->responsible_name,
            'email' => $lead->email,
            'phone' => $lead->phone,
            'status' => $lead->status,
            'origin' => $lead->origin,
            'referredBy' => $lead->referred_by,
            'notes' => $lead->notes,
            'createdAt' => optional($lead->created_at)->toIso8601String(),
            'updatedAt' => optional($lead->updated_at)->toIso8601String(),
        ];
    }
}

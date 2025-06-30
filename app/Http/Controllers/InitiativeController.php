<?php
namespace App\Http\Controllers;

use App\Models\Initiative;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class InitiativeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $initiatives = Initiative::with(['assignees', 'tags'])
            ->orderBy('status')
            ->orderBy('order')
            ->get();

        return response()->json($initiatives);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'org_structure_id' => 'required|exists:org_structures,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['required', Rule::in(['planned', 'in-progress', 'complete', 'on-hold', 'cancelled'])],
            'order' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'dueDate' => 'nullable|date',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:org_nodes,id',
            'tags' => 'nullable|array',
        ]);

        // Handle dueDate -> end_date conversion
        if (isset($validated['dueDate'])) {
            $validated['end_date'] = $validated['dueDate'];
            unset($validated['dueDate']);
        }

        // Set default order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = Initiative::where('status', $validated['status'])->max('order') ?? -1;
            $validated['order'] = $maxOrder + 1;
        }

        $initiative = Initiative::create($validated);

        // Sync assignees if provided
        if (isset($validated['assignees'])) {
            $initiative->assignees()->sync($validated['assignees']);
        }

        // Sync tags if provided
        if (isset($validated['tags'])) {
            $initiative->tags()->sync($validated['tags']);
        }

        return response()->json($initiative->load(['assignees', 'tags']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Initiative $initiative): JsonResponse
    {
        return response()->json($initiative->load(['assignees', 'tags']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Initiative $initiative): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => ['sometimes', 'required', Rule::in(['planned', 'in-progress', 'complete', 'on-hold', 'cancelled'])],
            'order' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'dueDate' => 'nullable|date',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:org_nodes,id',
            'tags' => 'nullable|array',
        ]);

        // Handle dueDate -> end_date conversion
        if (isset($validated['dueDate'])) {
            $validated['end_date'] = $validated['dueDate'];
            unset($validated['dueDate']);
        }

        $initiative->update($validated);

        // Sync assignees if provided
        if (isset($validated['assignees'])) {
            $initiative->assignees()->sync($validated['assignees']);
        }

        // Sync tags if provided
        if (isset($validated['tags'])) {
            $initiative->tags()->sync($validated['tags']);
        }

        return response()->json($initiative->load(['assignees', 'tags']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Initiative $initiative): JsonResponse
    {
        $initiative->delete();

        return response()->json(['message' => 'Initiative deleted successfully']);
    }
}

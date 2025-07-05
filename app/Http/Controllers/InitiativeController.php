<?php
namespace App\Http\Controllers;

use App\Models\Initiative;
use App\Models\Employee;
use App\Models\OrgStructure;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

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
    public function store(Request $request)
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
            'assignees.*' => 'exists:employees,id',
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

        // For API requests, return JSON
        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json($initiative->load(['assignees', 'tags']), 201);
        }

        // For Inertia requests, redirect back with success message
        return redirect()->back()->with('success', 'Initiative created successfully.');
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
            'assignees.*' => 'exists:employees,id',
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

        // For API requests, return JSON
        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json($initiative->load(['assignees', 'tags']));
        }

        // For Inertia requests, redirect back with success message
        return redirect()->back()->with('success', 'Initiative updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Initiative $initiative): JsonResponse
    {
        $initiative->delete();

        return response()->json(['message' => 'Initiative deleted successfully']);
    }

    /**
     * Display initiatives for a specific employee profile
     */
    public function profileInitiatives($id, Request $request)
    {
        // Get the employee
        $employee = \App\Models\Employee::findOrFail($id);

        // Get initiatives for this employee
        $query = Initiative::with(['assignees', 'tags'])
            ->whereHas('assignees', function($query) use ($id) {
                $query->where('employees.id', $id);
            });

        // Filter by status if specified
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $initiatives = $query->orderBy('end_date', 'asc')->paginate(15);

        return \Inertia\Inertia::render('Initiatives/ProfileInitiatives', [
            'employee' => [
                'id' => $employee->id,
                'full_name' => $employee->full_name,
                'title' => $employee->title,
                'email' => $employee->email,
                'status' => $employee->status
            ],
            'initiatives' => $initiatives,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Display initiatives page for web interface
     */
    public function webIndex()
    {
        $initiatives = Initiative::with(['assignees', 'tags'])
            ->orderBy('status')
            ->orderBy('order')
            ->get()->map(function ($initiative) {
                return [
                    'id' => $initiative->id,
                    'title' => $initiative->title,
                    'description' => $initiative->description,
                    'status' => $initiative->status,
                    'order' => $initiative->order,
                    'due_date' => $initiative->end_date,
                    'dueDate' => $initiative->end_date,
                    'assignees' => $initiative->assignees->pluck('id')->toArray(),
                    'tags' => $initiative->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    })->toArray(),
                    'teamLabel' => $initiative->teamLabel ?? '',
                    'allocations' => $initiative->allocations ?? [],
                    'created_at' => $initiative->created_at,
                    'updated_at' => $initiative->updated_at,
                ];
            });

        $employees = Employee::where('node_type', 'person')
            ->where('status', 'active')
            ->get(['id', 'first_name', 'last_name', 'email', 'title']);

        $defaultOrg = OrgStructure::where('user_id', auth()->id())
            ->orderBy('id')
            ->first();

        return Inertia::render('initiatives', [
            'initiatives' => $initiatives,
            'assignees' => $employees,
            'default_org_structure_id' => $defaultOrg ? $defaultOrg->id : null,
        ]);
    }

    /**
     * Display single initiative page for web interface
     */
    public function webShow(Initiative $initiative)
    {
        $initiative->load(['assignees', 'tags']);

        $initiativeData = [
            'id' => $initiative->id,
            'title' => $initiative->title,
            'description' => $initiative->description,
            'status' => $initiative->status,
            'order' => $initiative->order,
            'due_date' => $initiative->end_date,
            'dueDate' => $initiative->end_date,
            'assignees' => $initiative->assignees->pluck('id')->toArray(),
            'tags' => $initiative->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            })->toArray(),
            'teamLabel' => $initiative->teamLabel ?? '',
            'allocations' => $initiative->allocations ?? [],
            'created_at' => $initiative->created_at,
            'updated_at' => $initiative->updated_at,
        ];

        $employees = Employee::where('node_type', 'person')
            ->where('status', 'active')
            ->get(['id', 'first_name', 'last_name', 'email', 'title']);

        // Load notes for this initiative with their tags
        $notes = Note::where('notable_type', 'App\\Models\\Initiative')
            ->where('notable_id', $initiative->id)
            ->with('tags')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'content' => $note->content,
                    'created_at' => $note->created_at,
                    'updated_at' => $note->updated_at,
                    'tags' => $note->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                        ];
                    })->toArray(),
                ];
            });

        return Inertia::render('initiative', [
            'initiative' => $initiativeData,
            'assignees' => $employees,
            'notes' => $notes,
        ]);
    }
}

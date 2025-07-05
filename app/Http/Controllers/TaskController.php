<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Initiative;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks
     */
    public function index(Request $request): Response
    {
        $query = Task::with(['assignedTo', 'initiative', 'createdBy']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('initiative_id')) {
            $query->where('initiative_id', $request->initiative_id);
        }

        if ($request->filled('overdue') && $request->overdue) {
            $query->where('due_date', '<', now())
                  ->whereNotIn('status', ['completed', 'cancelled']);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('assignedTo', function($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'due_date');
        $sortOrder = $request->get('sort_order', 'asc');

        if ($sortBy === 'assignee') {
            $query->leftJoin('employees', 'tasks.assigned_to', '=', 'employees.id')
                  ->orderBy('employees.first_name', $sortOrder)
                  ->orderBy('employees.last_name', $sortOrder)
                  ->select('tasks.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $tasks = $query->paginate(50);

        // Transform tasks for frontend
        $tasks->getCollection()->transform(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'initiative_id' => $task->initiative_id,
                'assigned_to' => $task->assigned_to,
                'created_by' => $task->created_by,
                'due_date' => $task->due_date?->format('Y-m-d'),
                'percentage_complete' => $task->percentage_complete,
                'priority' => $task->priority,
                'status' => $task->status,
                'created_at' => $task->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $task->updated_at->format('Y-m-d H:i:s'),
                'initiative' => $task->initiative ? [
                    'id' => $task->initiative->id,
                    'title' => $task->initiative->title,
                ] : null,
                'assigned_to_node' => $task->assignedTo ? [
                    'id' => $task->assignedTo->id,
                    'first_name' => $task->assignedTo->first_name,
                    'last_name' => $task->assignedTo->last_name,
                    'email' => $task->assignedTo->email,
                ] : null,
                'created_by_user' => $task->createdBy ? [
                    'id' => $task->createdBy->id,
                    'first_name' => $task->createdBy->first_name,
                    'last_name' => $task->createdBy->last_name,
                ] : null,
                'tags' => $task->tags ? $task->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ];
                }) : [],
            ];
        });

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'initiatives' => Initiative::select(['id', 'title'])->get(),
            'employees' => Employee::select(['id', 'first_name', 'last_name', 'email'])->get(),
            'filters' => $request->only(['status', 'priority', 'assigned_to', 'initiative_id', 'overdue', 'search']),
            'sorting' => $request->only(['sort_by', 'sort_order']),
        ]);
    }

    /**
     * Store a newly created task
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'initiative_id' => 'nullable|exists:initiatives,id',
            'assigned_to' => 'nullable|exists:employees,id',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:not_started,in_progress,completed,on_hold,cancelled',
            'percentage_complete' => 'integer|min:0|max:100',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['percentage_complete'] = $validated['percentage_complete'] ?? 0;

        // Ensure initiative_id is properly cast to integer or set to null
        if (isset($validated['initiative_id']) && $validated['initiative_id'] !== '' && $validated['initiative_id'] !== null) {
            $validated['initiative_id'] = (int) $validated['initiative_id'];
        } else {
            $validated['initiative_id'] = null;
        }

        $task = Task::create($validated);
        $task->load(['assignedTo', 'initiative', 'createdBy', 'tags']);

        // Check if this is an Inertia request
        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Task created successfully',
                'task' => $this->transformTask($task)
            ]);
        }

        // For Inertia requests, if the task was created with an initiative_id,
        // redirect to the initiative's tasks tab
        if ($task->initiative_id) {
            return redirect()->route('initiative.show', [
                'initiative' => $task->initiative_id,
                'tab' => 'tasks'
            ])->with([
                'success' => 'Task created successfully',
                'task' => $this->transformTask($task)
            ]);
        }

        // Otherwise, redirect back with flash message
        return redirect()->back()->with([
            'success' => 'Task created successfully',
            'task' => $this->transformTask($task)
        ]);
    }

    /**
     * Display the specified task
     */
    public function show(Task $task): Response
    {
        $task->load(['assignedTo', 'initiative', 'createdBy', 'tags', 'notes']);

        return Inertia::render('Tasks/Show', [
            'task' => $this->transformTask($task)
        ]);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'initiative_id' => 'nullable|exists:initiatives,id',
            'assigned_to' => 'nullable|exists:employees,id',
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'status' => 'sometimes|required|in:not_started,in_progress,completed,on_hold,cancelled',
            'percentage_complete' => 'integer|min:0|max:100',
        ]);

        $task->update($validated);
        $task->load(['assignedTo', 'initiative', 'createdBy', 'tags']);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $this->transformTask($task)
            ]);
        }

        return redirect()->back()->with('success', 'Task updated successfully');
    }

    /**
     * Update task progress
     */
    public function updateProgress(Request $request, Task $task)
    {
        $validated = $request->validate([
            'percentage_complete' => 'required|integer|min:0|max:100',
        ]);

        $task->update($validated);

        // Auto-update status based on progress
        if ($validated['percentage_complete'] == 100) {
            $task->update(['status' => 'completed']);
        } elseif ($validated['percentage_complete'] > 0 && $task->status === 'not_started') {
            $task->update(['status' => 'in_progress']);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Task progress updated successfully',
                'task' => $this->transformTask($task)
            ]);
        }

        return redirect()->back()->with('success', 'Task progress updated successfully');
    }

    /**
     * Bulk update tasks
     */
    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'task_ids' => 'required|array',
            'task_ids.*' => 'exists:tasks,id',
            'status' => 'sometimes|required|in:not_started,in_progress,completed,on_hold,cancelled',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'assigned_to' => 'sometimes|nullable|exists:employees,id',
        ]);

        $updates = collect($validated)->except('task_ids')->toArray();
        $updatedCount = count($validated['task_ids']);

        Task::whereIn('id', $validated['task_ids'])->update($updates);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Tasks updated successfully',
                'updated_count' => $updatedCount
            ]);
        }

        return redirect()->back()->with('success', "{$updatedCount} tasks updated successfully");
    }

    /**
     * Delete the specified task
     */
    public function destroy(Task $task)
    {
        $task->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Task deleted successfully'
            ]);
        }

        return redirect()->route('tasks.index')->with('success', 'Task deleted successfully');
    }

    /**
     * Get task statistics
     */
    public function statistics(Request $request)
    {
        $query = Task::query();

        // Apply same filters as index for contextual stats
        if ($request->filled('initiative_id')) {
            $query->where('initiative_id', $request->initiative_id);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->get();

        $stats = [
            'total' => $tasks->count(),
            'completed' => $tasks->where('status', 'completed')->count(),
            'in_progress' => $tasks->where('status', 'in_progress')->count(),
            'not_started' => $tasks->where('status', 'not_started')->count(),
            'on_hold' => $tasks->where('status', 'on_hold')->count(),
            'cancelled' => $tasks->where('status', 'cancelled')->count(),
            'overdue' => $tasks->filter(function ($task) {
                return $task->due_date && $task->due_date->isPast() && !in_array($task->status, ['completed', 'cancelled']);
            })->count(),
            'avg_progress' => $tasks->count() > 0 ? round($tasks->avg('percentage_complete'), 1) : 0,
            'priority_breakdown' => [
                'urgent' => $tasks->where('priority', 'urgent')->count(),
                'high' => $tasks->where('priority', 'high')->count(),
                'medium' => $tasks->where('priority', 'medium')->count(),
                'low' => $tasks->where('priority', 'low')->count(),
            ]
        ];

        if ($request->wantsJson()) {
            return response()->json($stats);
        }

        return Inertia::render('Tasks/Statistics', [
            'stats' => $stats,
            'filters' => $request->only(['initiative_id', 'assigned_to']),
        ]);
    }

    /**
     * Transform task for API response
     */
    private function transformTask(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'initiative_id' => $task->initiative_id,
            'assigned_to' => $task->assigned_to,
            'created_by' => $task->created_by,
            'due_date' => $task->due_date?->format('Y-m-d'),
            'percentage_complete' => $task->percentage_complete,
            'priority' => $task->priority,
            'status' => $task->status,
            'created_at' => $task->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $task->updated_at->format('Y-m-d H:i:s'),
            'initiative' => $task->initiative ? [
                'id' => $task->initiative->id,
                'title' => $task->initiative->title,
            ] : null,
            'assigned_to_node' => $task->assignedTo ? [
                'id' => $task->assignedTo->id,
                'first_name' => $task->assignedTo->first_name,
                'last_name' => $task->assignedTo->last_name,
                'email' => $task->assignedTo->email,
            ] : null,
            'created_by_user' => $task->createdBy ? [
                'id' => $task->createdBy->id,
                'first_name' => $task->createdBy->first_name,
                'last_name' => $task->createdBy->last_name,
            ] : null,
            'tags' => $task->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            }),
        ];
    }

    /**
     * Get tasks for a specific initiative
     */
    public function forInitiative(Request $request, $initiative)
    {
        $tasks = Task::with(['assignedTo', 'initiative', 'createdBy', 'tags'])
            ->where('initiative_id', $initiative)
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($task) {
                return $this->transformTask($task);
            });

        return response()->json($tasks);
    }
}

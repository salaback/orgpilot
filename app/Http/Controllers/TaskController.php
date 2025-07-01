<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Initiative;
use App\Models\OrgNode;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks
     */
    public function index(Request $request)
    {
        $query = Task::with(['initiative', 'assignedTo', 'createdBy', 'tags']);

        // Filter by initiative if specified
        if ($request->has('initiative_id')) {
            $query->where('initiative_id', $request->initiative_id);
        }

        // Filter by assigned user if specified
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Filter by status if specified
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority if specified
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->orderBy('due_date', 'asc')->paginate(15);

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['initiative_id', 'assigned_to', 'status', 'priority', 'search']),
            'initiatives' => Initiative::select('id', 'title')->get(),
            'orgNodes' => OrgNode::where('status', 'active')->select('id', 'first_name', 'last_name')->get(),
        ]);
    }

    /**
     * Show the form for creating a new task
     */
    public function create(Request $request)
    {
        return Inertia::render('Tasks/Create', [
            'initiatives' => Initiative::select('id', 'title')->get(),
            'orgNodes' => OrgNode::where('status', 'active')->select('id', 'first_name', 'last_name', 'email')->get(),
            'initiative_id' => $request->get('initiative_id'),
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
            'assigned_to' => 'nullable|exists:org_nodes,id',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:not_started,in_progress,completed,on_hold,cancelled',
            'percentage_complete' => 'required|integer|min:0|max:100',
            'tags' => 'array',
            'tags.*' => 'string|max:255',
        ]);

        // Get the redirect_back parameter directly from the request
        $redirectBack = $request->boolean('redirect_back');

        $validated['created_by'] = auth()->id();

        $task = Task::create($validated);

        // Handle tags
        if (!empty($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => trim($tagName)]);
            });

            $task->tags()->sync($tags->pluck('id'));
        }

        // If redirect_back is true and we have an initiative_id, redirect to the initiative page
        if ($redirectBack && $task->initiative_id) {
            return redirect()->route('initiative.show', $task->initiative_id)
                ->with('success', 'Task created successfully.');
        }

        // Otherwise use the default redirect
        return redirect()->route('tasks.show', $task)
            ->with('success', 'Task created successfully.');
    }

    /**
     * Display the specified task
     */
    public function show(Task $task)
    {
        $task->load(['initiative', 'assignedTo', 'createdBy', 'tags', 'notes.tags']);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
            'orgNodes' => OrgNode::where('status', 'active')->select('id', 'first_name', 'last_name', 'email')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified task
     */
    public function edit(Task $task)
    {
        $task->load(['tags']);

        return Inertia::render('Tasks/Edit', [
            'task' => $task,
            'initiatives' => Initiative::select('id', 'title')->get(),
            'orgNodes' => OrgNode::where('status', 'active')->select('id', 'first_name', 'last_name', 'email')->get(),
        ]);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'initiative_id' => 'nullable|exists:initiatives,id',
            'assigned_to' => 'nullable|exists:org_nodes,id',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'status' => 'required|in:not_started,in_progress,completed,on_hold,cancelled',
            'percentage_complete' => 'required|integer|min:0|max:100',
            'tags' => 'array',
            'tags.*' => 'string|max:255',
        ]);

        // Get the redirect_back parameter directly from the request
        $redirectBack = $request->boolean('redirect_back');

        $task->update($validated);

        // Handle tags
        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => trim($tagName)]);
            });

            $task->tags()->sync($tags->pluck('id'));
        }

        // If redirect_back is true and we have an initiative_id, redirect to the initiative page
        if ($redirectBack && $task->initiative_id) {
            return redirect()->route('initiative.show', $task->initiative_id)
                ->with('success', 'Task updated successfully.');
        }

        // Otherwise use the default redirect
        return redirect()->route('tasks.show', $task)
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified task
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->route('tasks.index')
            ->with('success', 'Task deleted successfully.');
    }

    /**
     * Update task completion percentage
     */
    public function updateProgress(Request $request, Task $task)
    {
        $validated = $request->validate([
            'percentage_complete' => 'required|integer|min:0|max:100',
        ]);

        $task->update($validated);

        // Auto-update status based on completion
        if ($validated['percentage_complete'] == 100) {
            $task->update(['status' => 'completed']);
        } elseif ($validated['percentage_complete'] > 0 && $task->status == 'not_started') {
            $task->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Task progress updated successfully.');
    }

    /**
     * Get tasks for a specific initiative (API endpoint)
     */
    public function forInitiative(Initiative $initiative)
    {
        $tasks = $initiative->tasks()
            ->with(['assignedTo', 'tags'])
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json($tasks);
    }

    /**
     * Get overdue tasks
     */
    public function overdue()
    {
        $tasks = Task::overdue()
            ->with(['initiative', 'assignedTo', 'createdBy', 'tags'])
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('Tasks/Overdue', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Get tasks due soon
     */
    public function dueSoon()
    {
        $tasks = Task::dueSoon()
            ->with(['initiative', 'assignedTo', 'createdBy', 'tags'])
            ->orderBy('due_date', 'asc')
            ->get();

        return Inertia::render('Tasks/DueSoon', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Display tasks for a specific org node profile
     */
    public function profileTasks($id, Request $request)
    {
        // Get the org node
        $orgNode = OrgNode::findOrFail($id);

        // Get tasks for this org node
        $query = Task::with(['initiative', 'assignedTo', 'createdBy', 'tags'])
            ->where('assigned_to', $id);

        // Filter by status if specified
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority if specified
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tasks = $query->orderBy('due_date', 'asc')->paginate(15);

        return Inertia::render('Tasks/ProfileTasks', [
            'orgNode' => [
                'id' => $orgNode->id,
                'full_name' => $orgNode->first_name . ' ' . $orgNode->last_name,
                'title' => $orgNode->title,
                'email' => $orgNode->email,
                'status' => $orgNode->status
            ],
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority', 'search']),
            'initiatives' => Initiative::select('id', 'title')->get()
        ]);
    }
}

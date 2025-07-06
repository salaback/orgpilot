<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Task;
use App\Models\Employee;
use App\Models\Initiative;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OneOnOneMeetingController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the 1:1 meeting hub for a specific direct report.
     */
    public function index(Request $request, Employee $employee)
    {
        $this->authorize('view', $employee);

        /** @var \App\Models\User $currentUser */
        $currentUser = auth()->user();
        if (!$currentUser) {
            abort(403, 'Unauthorized action.');
        }

        // Get upcoming meeting if any using the new Meeting model with type filtering
        $upcomingMeeting = Meeting::where('created_by', $currentUser->id)
            ->where('type', Meeting::TYPE_ONE_ON_ONE)
            ->whereHas('meetingParticipants', function($query) use ($employee) {
                $query->where('participantable_type', Employee::class)
                      ->where('participantable_id', $employee->id);
            })
            ->upcoming()
            ->first();

        if ($upcomingMeeting) {
            $upcomingMeeting->load(['tasks', 'goals', 'initiatives']);
        }

        // Get past meetings
        $pastMeetings = Meeting::where('created_by', $currentUser->id)
            ->where('type', Meeting::TYPE_ONE_ON_ONE)
            ->whereHas('meetingParticipants', function($query) use ($employee) {
                $query->where('participantable_type', Employee::class)
                      ->where('participantable_id', $employee->id);
            })
            ->where('status', '!=', Meeting::STATUS_SCHEDULED)
            ->orderBy('meeting_time', 'desc')
            ->get();

        // Use the original OneOnOneMeetings component for backward compatibility
        return Inertia::render('OneOnOneMeetings/Index', [
            'directReport' => $employee,
            'upcomingMeeting' => $upcomingMeeting,
            'pastMeetings' => $pastMeetings,
        ]);
    }

    /**
     * Show the form for creating a new 1:1 meeting.
     */
    public function create(Request $request, Employee $employee)
    {
        $this->authorize('view', $employee);

        /** @var \App\Models\User $currentUser */
        $currentUser = auth()->user();

        // Get goals for the direct report
        $goals = $employee->goals()->active()->get();

        // Get initiatives assigned to the direct report
        $initiatives = $employee->initiatives()->active()->get();

        // Get available users for task assignments
        $availableUsers = User::orderBy('first_name')->get();

        // Get incomplete tasks that could be carried forward
        $incompleteTasks = Task::where('assigned_to', $employee->id)
            ->where('status', '!=', 'completed')
            ->get();

        // Use the original component for backward compatibility
        return Inertia::render('OneOnOneMeetings/Create', [
            'directReport' => $employee,
            'goals' => $goals,
            'initiatives' => $initiatives,
            'incompleteActionItems' => $incompleteTasks, // Format as expected by the original component
            'availableOwners' => $availableUsers->map(function($user) {
                return ['id' => $user->id, 'name' => $user->name];
            }),
            'availableGoals' => $goals,
            'availableInitiatives' => $initiatives,
            'isEditing' => false
        ]);
    }

    /**
     * Store a newly created 1:1 meeting.
     */
    public function store(Request $request, Employee $employee)
    {
        $this->authorize('view', $employee);

        /** @var \App\Models\User $currentUser */
        $currentUser = auth()->user();
        if (!$currentUser) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'meeting_time' => 'required|date_format:Y-m-d\TH:i',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string',
            'action_items' => 'nullable|array',
            'goals' => 'nullable|array',
            'goals.*' => 'exists:goals,id',
            'initiatives' => 'nullable|array',
            'initiatives.*' => 'exists:initiatives,id',
        ]);

        // Use meeting_time directly from validated data
        $meeting = Meeting::create([
            'title' => auth()->user()->name . ' <-> ' . $employee->full_name,
            'type' => Meeting::TYPE_ONE_ON_ONE,
            'meeting_time' => $validated['meeting_time'],
            'duration_minutes' => $request->input('duration_minutes', 30),
            'location' => $validated['location'] ?? null,
            'agenda' => $validated['agenda'] ?? null,
            'notes' => null,
            'status' => Meeting::STATUS_SCHEDULED,
            'created_by' => auth()->id(),
        ]);

        // Add the direct report (employee) as a participant
        $meeting->meetingParticipants()->create([
            'participantable_type' => Employee::class,
            'participantable_id' => $employee->id,
        ]);

        // Handle action items if provided
        if (isset($validated['action_items']) && is_array($validated['action_items'])) {
            foreach ($validated['action_items'] as $itemData) {
                Task::create([
                    'meeting_id' => $meeting->id,
                    'title' => $itemData['description'],
                    'description' => $itemData['description'],
                    'assigned_to' => $itemData['owner_id'],
                    'due_date' => $itemData['due_date'],
                    'status' => 'not_started',
                    'created_by' => auth()->id(),
                ]);
            }
        }

        // Attach goals if provided
        if (isset($validated['goals']) && is_array($validated['goals'])) {
            $meeting->goals()->attach($validated['goals']);
        }

        // Attach initiatives if provided
        if (isset($validated['initiatives']) && is_array($validated['initiatives'])) {
            $meeting->initiatives()->attach($validated['initiatives']);
        }

        return redirect()->route('one-on-one.index', [
            'employee' => $employee->id
        ])->with('success', '1:1 meeting scheduled successfully');
    }

    /**
     * Display the specified 1:1 meeting.
     */
    public function show(Employee $employee, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $this->authorize('view', $meeting);

        $meeting->load(['tasks', 'goals', 'initiatives', 'participants', 'createdBy']);

        // Get direct report from participants
        $directReport = $meeting->participants()
            ->where('users.id', '!=', $meeting->created_by)
            ->first();

        return Inertia::render('Meetings/Detail', [
            'meeting' => $meeting->toArray(),
            'directReport' => $directReport ? $directReport->toArray() : $employee->toArray(),
        ]);
    }

    /**
     * Show the form for editing the specified 1:1 meeting.
     */
    public function edit(Employee $employee, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $this->authorize('update', $meeting);

        $meeting->load(['tasks', 'goals', 'initiatives', 'participants']);

        // Get goals for the direct report
        $goals = $employee->goals()->active()->get();

        // Get initiatives assigned to the direct report
        $initiatives = $employee->initiatives()->active()->get();

        // Get available users for task assignments
        $availableUsers = User::orderBy('first_name')->get();

        // Get incomplete tasks that could be carried forward
        $incompleteTasks = Task::where('assigned_to', $employee->id)
            ->where('status', '!=', 'completed')
            ->where('meeting_id', '!=', $meeting->id)
            ->get();

        return Inertia::render('Meetings/OneOnOne/Edit', [
            'meeting' => $meeting,
            'directReport' => $employee,
            'goals' => $goals,
            'initiatives' => $initiatives,
            'incompleteTasks' => $incompleteTasks,
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * Update the specified 1:1 meeting.
     */
    public function update(Request $request, Employee $employee, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meeting_time' => 'required|date',
            'duration_minutes' => 'required|integer|min:1',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string',
            'notes' => 'nullable|string',
            'summary' => 'nullable|string',
            'tasks' => 'nullable|array',
            'goals' => 'nullable|array',
            'goals.*' => 'exists:goals,id',
            'initiatives' => 'nullable|array',
            'initiatives.*' => 'exists:initiatives,id',
        ]);

        // Update the meeting
        $meeting->update([
            'title' => $validated['title'],
            'meeting_time' => $validated['meeting_time'],
            'duration_minutes' => $validated['duration_minutes'],
            'location' => $validated['location'] ?? null,
            'agenda' => $validated['agenda'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'summary' => $validated['summary'] ?? null,
        ]);

        // Handle tasks
        if (isset($validated['tasks'])) {
            // Delete tasks that aren't in the new list
            $existingTaskIds = collect($validated['tasks'])
                ->filter(function ($task) {
                    return isset($task['id']);
                })
                ->pluck('id');

            Task::where('meeting_id', $meeting->id)
                ->whereNotIn('id', $existingTaskIds)
                ->delete();

            // Update or create tasks
            foreach ($validated['tasks'] as $taskData) {
                if (isset($taskData['id'])) {
                    Task::where('id', $taskData['id'])->update([
                        'description' => $taskData['description'],
                        'assigned_to' => $taskData['assigned_to'],
                        'due_date' => $taskData['due_date'],
                        'status' => $taskData['status'] ?? 'pending',
                    ]);
                } else {
                    Task::create([
                        'meeting_id' => $meeting->id,
                        'title' => $taskData['description'],
                        'description' => $taskData['description'],
                        'assigned_to' => $taskData['assigned_to'],
                        'due_date' => $taskData['due_date'],
                        'status' => 'not_started',
                        'created_by' => auth()->id(),
                    ]);
                }
            }
        }

        // Sync goals and initiatives
        $meeting->goals()->sync($validated['goals'] ?? []);
        $meeting->initiatives()->sync($validated['initiatives'] ?? []);

        return redirect()->route('one-on-one.show', [
            'employee' => $employee->id,
            'meeting' => $meeting->id
        ])->with('success', '1:1 meeting updated successfully');
    }

    /**
     * Mark a meeting as completed.
     */
    public function complete(Request $request, Employee $employee, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'summary' => 'nullable|string',
        ]);

        $meeting->update([
            'status' => Meeting::STATUS_COMPLETED,
            'summary' => $validated['summary'] ?? $meeting->summary,
        ]);

        return redirect()->route('one-on-one.show', [
            'employee' => $employee->id,
            'meeting' => $meeting->id
        ])->with('success', '1:1 meeting marked as completed');
    }

    /**
     * Cancel a meeting.
     */
    public function cancel(Request $request, Employee $employee, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $this->authorize('update', $meeting);

        $meeting->update([
            'status' => Meeting::STATUS_CANCELLED,
        ]);

        return redirect()->route('one-on-one.index', [
            'employee' => $employee->id
        ])->with('success', '1:1 meeting cancelled');
    }
}

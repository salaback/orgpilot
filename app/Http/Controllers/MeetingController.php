<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\MeetingSeries;
use App\Models\User;
use App\Models\Initiative;
use App\Models\Goal;
use App\Models\Tag;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeetingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Meeting::with(['createdBy', 'meetingSeries', 'participants', 'tasks', 'tags']);

        // Filter by meeting type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // For one-on-one meetings, can filter by creator (manager) or participant (direct report)
        if ($request->has('manager_id')) {
            $query->where('type', Meeting::TYPE_ONE_ON_ONE)
                  ->where('created_by', $request->manager_id);
        }

        if ($request->has('direct_report_id')) {
            $query->where('type', Meeting::TYPE_ONE_ON_ONE)
                  ->whereHas('participants', function($q) use ($request) {
                      $q->where('users.id', $request->direct_report_id);
                  });
        }

        $meetings = $query->orderBy('meeting_time', 'desc')->get();

        return Inertia::render('Meetings/Index', [
            'meetings' => $meetings,
            'meetingTypes' => Meeting::getTypes(),
            'currentType' => $request->type ?? 'all'
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $meetingSeries = MeetingSeries::orderBy('title')->get();
        $users = User::orderBy('first_name')->get();
        $initiatives = Initiative::orderBy('title')->get();
        $tags = Tag::orderBy('name')->get();
        $type = $request->type ?? Meeting::TYPE_REGULAR;

        return Inertia::render('Meetings/Create', [
            'meetingSeries' => $meetingSeries,
            'users' => $users,
            'initiatives' => $initiatives,
            'tags' => $tags,
            'meetingTypes' => Meeting::getTypes(),
            'type' => $type,
            'currentUser' => auth()->user(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validationRules = [
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:' . implode(',', array_keys(Meeting::getTypes())),
            'meeting_time' => 'required|date',
            'duration_minutes' => 'required|integer|min:1',
            'meeting_series_id' => 'nullable|exists:meeting_series,id',
            'participants' => 'nullable|array',
            'tags' => 'nullable|array',
            'agenda' => 'nullable|string',
            'notes' => 'nullable|string',
            'location' => 'nullable|string',
        ];

        // For one-on-one meetings, require at least one participant
        if ($request->type === Meeting::TYPE_ONE_ON_ONE) {
            $validationRules['participants'] = 'required|array|min:1';
            $validationRules['participants.*.id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($validationRules);

        // Handle the meeting creation
        $meeting = Meeting::create([
            'title' => $validated['title'],
            'type' => $validated['type'],
            'meeting_time' => $validated['meeting_time'],
            'duration_minutes' => $validated['duration_minutes'],
            'meeting_series_id' => $validated['meeting_series_id'] ?? null,
            'agenda' => $validated['agenda'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'location' => $validated['location'] ?? null,
            'created_by' => auth()->id(),
            'status' => Meeting::STATUS_SCHEDULED,
        ]);

        // Handle participants
        if (isset($validated['participants']) && is_array($validated['participants'])) {
            foreach ($validated['participants'] as $participant) {
                if (!isset($participant['id'])) {
                    continue;
                }

                $role = null;

                // For one-on-one meetings, set the role appropriately
                if ($validated['type'] === Meeting::TYPE_ONE_ON_ONE) {
                    $role = 'direct_report';
                }

                $meeting->participants()->attach($participant['id'], [
                    'participantable_type' => User::class,
                    'role' => $role
                ]);
            }
        }

        // Handle tags
        if (isset($validated['tags']) && is_array($validated['tags'])) {
            $tagIds = collect($validated['tags'])->pluck('id')->toArray();
            $meeting->tags()->sync($tagIds);
        }

        return redirect()->route('meetings.show', $meeting->id)
            ->with('success', 'Meeting created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Meeting $meeting)
    {
        $meeting->load([
            'createdBy',
            'meetingSeries',
            'participants',
            'externalParticipants',
            'tasks.assignedTo',
            'tasks.createdBy',
            'tags',
            'initiatives',
            'notes' // Load notes for the meeting
        ]);

        // Get tasks from previous meetings if this is part of a series
        $previousTasks = [];
        $completedTasks = [];
        $openTasks = [];

        if ($meeting->meeting_series_id) {
            $previousTasks = $meeting->tasksFromPreviousMeeting();
            $completedTasks = $meeting->tasksCompletedSincePreviousMeeting();
            $openTasks = $meeting->openTasksFromSeries();
        }

        return Inertia::render('Meetings/Detail', [
            'meeting' => $meeting,
            'previousTasks' => $previousTasks,
            'completedTasks' => $completedTasks,
            'openTasks' => $openTasks,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Meeting $meeting)
    {
        $meeting->load(['participants', 'externalParticipants', 'initiatives', 'tags']);

        $meetingSeries = MeetingSeries::orderBy('title')->get();
        $users = User::orderBy('first_name')->get();
        $initiatives = Initiative::orderBy('title')->get();
        $tags = Tag::orderBy('name')->get();

        return Inertia::render('Meetings/Edit', [
            'meeting' => $meeting,
            'meetingSeries' => $meetingSeries,
            'users' => $users,
            'initiatives' => $initiatives,
            'tags' => $tags
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Meeting $meeting)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meeting_series_id' => 'nullable|exists:meeting_series,id',
            'meeting_time' => 'required|date',
            'duration_minutes' => 'nullable|integer|min:15',
            'notes' => 'nullable|string',
            'participants' => 'array',
            'participants.*.user_id' => 'nullable|exists:users,id',
            'participants.*.external_name' => 'nullable|string',
            'initiatives' => 'array',
            'initiatives.*' => 'exists:initiatives,id',
            'tags' => 'array',
            'tags.*' => 'exists:tags,id',
        ]);

        $meeting->update([
            'title' => $validated['title'],
            'meeting_series_id' => $validated['meeting_series_id'],
            'meeting_time' => $validated['meeting_time'],
            'duration_minutes' => $validated['duration_minutes'] ?? 60,
            'notes' => $validated['notes'],
        ]);

        // Update participants
        $meeting->participants()->detach();
        $meeting->externalParticipants()->delete();

        if (isset($validated['participants'])) {
            foreach ($validated['participants'] as $participant) {
                if (isset($participant['user_id'])) {
                    $meeting->participants()->attach($participant['user_id']);
                } elseif (isset($participant['external_name'])) {
                    $meeting->externalParticipants()->create([
                        'external_participant_name' => $participant['external_name']
                    ]);
                }
            }
        }

        // Update initiatives
        $meeting->initiatives()->sync($validated['initiatives'] ?? []);

        // Update tags
        $meeting->tags()->sync($validated['tags'] ?? []);

        return redirect()->route('meetings.show', $meeting)
            ->with('success', 'Meeting updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Meeting $meeting)
    {
        $meeting->delete();

        return redirect()->route('meetings.index')
            ->with('success', 'Meeting deleted successfully.');
    }

    /**
     * Create a task during a meeting
     */
    public function createTask(Request $request, Meeting $meeting)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'initiative_id' => 'nullable|exists:initiatives,id',
        ]);

        $task = Task::create([
            ...$validated,
            'meeting_id' => $meeting->id,
            'created_by' => auth()->id(),
            'status' => 'not_started',
            'percentage_complete' => 0,
        ]);

        return back()->with('success', 'Task created successfully.');
    }

    /**
     * Show the form for creating a new one-on-one meeting.
     */
    public function oneOnOneCreate(Request $request)
    {
        // A direct report ID is required for one-on-one meetings
        if (!$request->has('direct_report_id')) {
            return redirect()->route('meetings.index', ['type' => Meeting::TYPE_ONE_ON_ONE])
                ->with('error', 'A direct report must be specified to create a one-on-one meeting.');
        }

        $directReport = User::findOrFail($request->direct_report_id);
        $currentUser = auth()->user();

        // Get all users for task assignments
        $availableUsers = User::orderBy('first_name')->get();

        // Get incomplete tasks for the direct report
        $incompleteTasks = Task::where('assigned_to', $directReport->id)
            ->where('status', '!=', 'completed')
            ->get();

        // Get goals if available
        $goals = Goal::whereHas('users', function($query) use ($directReport) {
            $query->where('users.id', $directReport->id);
        })->where('status', 'active')->get();

        // Get initiatives
        $initiatives = Initiative::whereHas('users', function($query) use ($directReport) {
            $query->where('users.id', $directReport->id);
        })->get();

        return Inertia::render('Meetings/OneOnOne/Create', [
            'directReport' => $directReport,
            'goals' => $goals,
            'initiatives' => $initiatives,
            'incompleteTasks' => $incompleteTasks,
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * Store a newly created one-on-one meeting.
     */
    public function oneOnOneStore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meeting_time' => 'required|date',
            'duration_minutes' => 'required|integer|min:1',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string',
            'notes' => 'nullable|string',
            'participants' => 'required|array|min:1',
            'participants.*.id' => 'required|exists:users,id',
            'tasks' => 'nullable|array',
            'goals' => 'nullable|array',
            'initiatives' => 'nullable|array',
        ]);

        // Create the meeting
        $meeting = Meeting::create([
            'title' => $validated['title'],
            'type' => Meeting::TYPE_ONE_ON_ONE,
            'meeting_time' => $validated['meeting_time'],
            'duration_minutes' => $validated['duration_minutes'],
            'location' => $validated['location'] ?? null,
            'agenda' => $validated['agenda'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
            'status' => Meeting::STATUS_SCHEDULED,
        ]);

        // Add participants (direct reports)
        foreach ($validated['participants'] as $participant) {
            $meeting->participants()->attach($participant['id'], [
                'participantable_type' => User::class,
                'role' => 'direct_report'
            ]);
        }

        // Handle tasks if provided
        if (isset($validated['tasks']) && is_array($validated['tasks'])) {
            foreach ($validated['tasks'] as $taskData) {
                Task::create([
                    'meeting_id' => $meeting->id,
                    'description' => $taskData['description'],
                    'assigned_to' => $taskData['assigned_to'],
                    'due_date' => $taskData['due_date'],
                    'status' => 'pending',
                    'created_by' => auth()->id(),
                    'task_type' => 'action_item',
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

        return redirect()->route('meetings.show', $meeting->id)
            ->with('success', '1:1 meeting scheduled successfully');
    }

    /**
     * Display a listing of one-on-one meetings.
     */
    public function oneOnOneIndex(Request $request)
    {
        $currentUser = auth()->user();

        // Get meetings where current user is either creator (manager) or participant (direct report)
        $query = Meeting::with(['createdBy', 'participants', 'tasks'])
            ->where('type', Meeting::TYPE_ONE_ON_ONE)
            ->where(function($q) use ($currentUser) {
                $q->where('created_by', $currentUser->id)
                  ->orWhereHas('participants', function($q2) use ($currentUser) {
                      $q2->where('users.id', $currentUser->id);
                  });
            });

        // Filter by direct report if specified
        if ($request->has('direct_report_id')) {
            $query->whereHas('participants', function($q) use ($request) {
                $q->where('users.id', $request->direct_report_id);
            });
        }

        $meetings = $query->orderBy('meeting_time', 'desc')->get();

        // Split into upcoming and past meetings
        $upcomingMeetings = $meetings->filter(function($meeting) {
            return $meeting->status === Meeting::STATUS_SCHEDULED;
        });

        $pastMeetings = $meetings->filter(function($meeting) {
            return $meeting->status !== Meeting::STATUS_SCHEDULED;
        });

        // If direct_report_id is provided, get the employee data
        $directReport = null;
        if ($request->has('direct_report_id')) {
            $directReport = User::find($request->direct_report_id);
        }

        return Inertia::render('Meetings/OneOnOne/Index', [
            'directReport' => $directReport,
            'upcomingMeetings' => $upcomingMeetings->values(),
            'pastMeetings' => $pastMeetings->values(),
        ]);
    }

    /**
     * Show the form for editing a one-on-one meeting.
     */
    public function oneOnOneEdit(Request $request, Meeting $meeting)
    {
        // Ensure this is a one-on-one meeting
        if ($meeting->type !== Meeting::TYPE_ONE_ON_ONE) {
            return redirect()->route('meetings.edit', $meeting->id);
        }

        $meeting->load(['tasks', 'goals', 'initiatives', 'participants']);

        // Get the direct report from participants
        $directReport = $meeting->participants()
            ->where('users.id', '!=', $meeting->created_by)
            ->first();

        if (!$directReport) {
            return redirect()->route('meetings.edit', $meeting->id)
                ->with('error', 'Could not identify direct report for this one-on-one meeting.');
        }

        // Get all users for task assignments
        $availableUsers = User::orderBy('first_name')->get();

        // Get incomplete tasks for the direct report
        $incompleteTasks = Task::where('assigned_to', $directReport->id)
            ->where('status', '!=', 'completed')
            ->where('meeting_id', '!=', $meeting->id)
            ->get();

        // Get goals
        $goals = Goal::whereHas('users', function($query) use ($directReport) {
            $query->where('users.id', $directReport->id);
        })->where('status', 'active')->get();

        // Get initiatives
        $initiatives = Initiative::whereHas('users', function($query) use ($directReport) {
            $query->where('users.id', $directReport->id);
        })->get();

        return Inertia::render('Meetings/OneOnOne/Edit', [
            'meeting' => $meeting,
            'directReport' => $directReport,
            'goals' => $goals,
            'initiatives' => $initiatives,
            'incompleteTasks' => $incompleteTasks,
            'availableUsers' => $availableUsers,
        ]);
    }
}

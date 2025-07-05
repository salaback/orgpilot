<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\MeetingSeries;
use App\Models\User;
use App\Models\Initiative;
use App\Models\Tag;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeetingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meetings = Meeting::with(['createdBy', 'meetingSeries', 'participants', 'tasks', 'tags'])
            ->orderBy('meeting_time', 'desc')
            ->get();

        return Inertia::render('Meetings/Index', [
            'meetings' => $meetings
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $meetingSeries = MeetingSeries::orderBy('title')->get();
        $users = User::orderBy('first_name')->get();
        $initiatives = Initiative::orderBy('title')->get();
        $tags = Tag::orderBy('name')->get();

        return Inertia::render('Meetings/Create', [
            'meetingSeries' => $meetingSeries,
            'users' => $users,
            'initiatives' => $initiatives,
            'tags' => $tags
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'meeting_series_id' => 'nullable|exists:meeting_series,id',
            'meeting_time' => 'required|date',
            'notes' => 'nullable|string',
            'participants' => 'array',
            'participants.*.user_id' => 'nullable|exists:users,id',
            'participants.*.external_name' => 'nullable|string',
            'initiatives' => 'array',
            'initiatives.*' => 'exists:initiatives,id',
            'tags' => 'array',
            'tags.*' => 'exists:tags,id',
        ]);

        $meeting = Meeting::create([
            'title' => $validated['title'],
            'meeting_series_id' => $validated['meeting_series_id'],
            'meeting_time' => $validated['meeting_time'],
            'notes' => $validated['notes'],
            'created_by' => auth()->id(),
        ]);

        // Attach participants
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

        // Attach initiatives
        if (isset($validated['initiatives'])) {
            $meeting->initiatives()->attach($validated['initiatives']);
        }

        // Attach tags
        if (isset($validated['tags'])) {
            $meeting->tags()->attach($validated['tags']);
        }

        return redirect()->route('meetings.show', $meeting)
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
            'initiatives'
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

        return Inertia::render('Meetings/Show', [
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
}

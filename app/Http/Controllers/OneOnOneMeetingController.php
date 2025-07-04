<?php

namespace App\Http\Controllers;

use App\Models\OneOnOneMeeting;
use App\Models\OneOnOneActionItem;
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

        $currentUser = auth()->user();

        // Get upcoming meeting if any
        $upcomingMeeting = OneOnOneMeeting::where('manager_id', $currentUser->id)
            ->where('direct_report_employee_id', $employee->id)
            ->upcoming()
            ->first();

        if ($upcomingMeeting) {
            $upcomingMeeting->load(['actionItems.owner', 'goals', 'initiatives']);
        }

        // Get past meetings
        $pastMeetings = OneOnOneMeeting::where('manager_id', $currentUser->id)
            ->where('direct_report_employee_id', $employee->id)
            ->where('status', '!=', OneOnOneMeeting::STATUS_SCHEDULED)
            ->orderBy('scheduled_at', 'desc')
            ->get();

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

        $currentUser = auth()->user();

        // Get goals for the direct report
        $goals = $employee->goals()->active()->get();

        // Get initiatives assigned to the direct report
        $initiatives = $employee->initiatives()->active()->get();

        return Inertia::render('OneOnOneMeetings/Create', [
            'directReport' => $employee,
            'goals' => $goals,
            'initiatives' => $initiatives,
        ]);
    }

    /**
     * Store a newly created 1:1 meeting.
     */
    public function store(Request $request, Employee $employee)
    {
        $this->authorize('view', $employee);

        $validated = $request->validate([
            'scheduled_at' => 'required|date',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string',
            'private_notes' => 'nullable|string',
            'shared_notes' => 'nullable|string',
            'goals' => 'nullable|array',
            'goals.*' => 'exists:goals,id',
            'initiatives' => 'nullable|array',
            'initiatives.*' => 'exists:initiatives,id',
        ]);

        // Create the meeting
        $meeting = new OneOnOneMeeting();
        $meeting->manager_id = auth()->id();
        $meeting->direct_report_employee_id = $employee->id;
        $meeting->scheduled_at = $validated['scheduled_at'];
        $meeting->location = $validated['location'] ?? null;
        $meeting->agenda = $validated['agenda'] ?? null;
        $meeting->private_notes = $validated['private_notes'] ?? null;
        $meeting->shared_notes = $validated['shared_notes'] ?? null;
        $meeting->status = OneOnOneMeeting::STATUS_SCHEDULED;
        $meeting->save();

        // Attach goals if any
        if (!empty($validated['goals'])) {
            $meeting->goals()->attach($validated['goals']);
        }

        // Attach initiatives if any
        if (!empty($validated['initiatives'])) {
            $meeting->initiatives()->attach($validated['initiatives']);
        }

        return redirect()->route('one-on-ones.show', [
            'employee' => $employee->id,
            'meeting' => $meeting->id
        ])->with('success', 'Meeting scheduled successfully.');
    }

    /**
     * Display the specified 1:1 meeting.
     */
    public function show(Request $request, Employee $employee, OneOnOneMeeting $meeting)
    {
        $this->authorize('view', $meeting);

        $meeting->load(['actionItems.owner', 'goals', 'initiatives']);

        return Inertia::render('OneOnOneMeetings/Show', [
            'directReport' => $employee,
            'meeting' => $meeting,
        ]);
    }

    /**
     * Show the form for editing the specified 1:1 meeting.
     */
    public function edit(Request $request, Employee $employee, OneOnOneMeeting $meeting)
    {
        $this->authorize('update', $meeting);

        $meeting->load(['actionItems.owner', 'goals', 'initiatives']);

        // Get goals for the direct report
        $goals = $employee->goals()->active()->get();

        // Get initiatives assigned to the direct report
        $initiatives = $employee->assignedInitiatives()->active()->get();

        return Inertia::render('OneOnOneMeetings/Edit', [
            'directReport' => $employee,
            'meeting' => $meeting,
            'goals' => $goals,
            'initiatives' => $initiatives,
        ]);
    }

    /**
     * Update the specified 1:1 meeting.
     */
    public function update(Request $request, Employee $employee, OneOnOneMeeting $meeting)
    {
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'scheduled_at' => 'required|date',
            'location' => 'nullable|string|max:255',
            'agenda' => 'nullable|string',
            'private_notes' => 'nullable|string',
            'shared_notes' => 'nullable|string',
            'summary' => 'nullable|string',
            'goals' => 'nullable|array',
            'goals.*' => 'exists:goals,id',
            'initiatives' => 'nullable|array',
            'initiatives.*' => 'exists:initiatives,id',
            'action_items' => 'nullable|array',
            'action_items.*.id' => 'nullable|exists:one_on_one_action_items,id',
            'action_items.*.description' => 'required|string|max:255',
            'action_items.*.due_date' => 'nullable|date',
            'action_items.*.owner_type' => 'required|in:manager,direct_report',
            'action_items.*.status' => 'required|in:open,complete',
        ]);

        // Update meeting details
        $meeting->scheduled_at = $validated['scheduled_at'];
        $meeting->location = $validated['location'] ?? null;
        $meeting->agenda = $validated['agenda'] ?? null;
        $meeting->private_notes = $validated['private_notes'] ?? null;
        $meeting->shared_notes = $validated['shared_notes'] ?? null;
        $meeting->summary = $validated['summary'] ?? null;
        $meeting->save();

        // Sync goals
        $meeting->goals()->sync($validated['goals'] ?? []);

        // Sync initiatives
        $meeting->initiatives()->sync($validated['initiatives'] ?? []);

        // Handle action items
        if (isset($validated['action_items'])) {
            $existingItemIds = [];

            foreach ($validated['action_items'] as $actionItemData) {
                if (isset($actionItemData['id'])) {
                    // Update existing action item
                    $actionItem = OneOnOneActionItem::findOrFail($actionItemData['id']);
                    $actionItem->update([
                        'description' => $actionItemData['description'],
                        'due_date' => $actionItemData['due_date'] ?? null,
                        'owner_type' => $actionItemData['owner_type'],
                        'status' => $actionItemData['status'],
                    ]);
                    $existingItemIds[] = $actionItem->id;
                } else {
                    // Create new action item
                    $actionItem = new OneOnOneActionItem([
                        'description' => $actionItemData['description'],
                        'due_date' => $actionItemData['due_date'] ?? null,
                        'owner_type' => $actionItemData['owner_type'],
                        'status' => $actionItemData['status'],
                    ]);
                    $meeting->actionItems()->save($actionItem);
                    $existingItemIds[] = $actionItem->id;
                }
            }

            // Delete any action items not in the request
            $meeting->actionItems()->whereNotIn('id', $existingItemIds)->delete();
        }

        return redirect()->route('one-on-ones.show', [
            'employee' => $employee->id,
            'meeting' => $meeting->id
        ])->with('success', 'Meeting updated successfully.');
    }

    /**
     * Mark a meeting as complete.
     */
    public function complete(Request $request, Employee $employee, OneOnOneMeeting $meeting)
    {
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'summary' => 'nullable|string',
        ]);

        $meeting->summary = $validated['summary'] ?? $meeting->summary;
        $meeting->status = OneOnOneMeeting::STATUS_COMPLETED;
        $meeting->completed_at = now();
        $meeting->save();

        return redirect()->route('one-on-ones.index', ['employee' => $employee->id])
            ->with('success', 'Meeting marked as complete.');
    }

    /**
     * Cancel a scheduled meeting.
     */
    public function cancel(Request $request, Employee $employee, OneOnOneMeeting $meeting)
    {
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'cancellation_reason' => 'nullable|string|max:255',
        ]);

        $meeting->status = OneOnOneMeeting::STATUS_CANCELLED;
        $meeting->cancellation_reason = $validated['cancellation_reason'] ?? null;
        $meeting->save();

        return redirect()->route('one-on-ones.index', ['employee' => $employee->id])
            ->with('success', 'Meeting cancelled.');
    }
}

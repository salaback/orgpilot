<?php

namespace App\Http\Controllers;

use App\Models\OneOnOneMeeting;
use App\Models\OneOnOneActionItem;
use App\Models\OrgNode;
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
    public function index(Request $request, OrgNode $orgNode)
    {
        $this->authorize('view', $orgNode);

        $currentUser = auth()->user();

        // Get upcoming meeting if any
        $upcomingMeeting = OneOnOneMeeting::where('manager_id', $currentUser->id)
            ->where('direct_report_node_id', $orgNode->id)
            ->upcoming()
            ->first();

        if ($upcomingMeeting) {
            $upcomingMeeting->load(['actionItems.owner', 'goals', 'initiatives']);
        }

        // Get past meetings
        $pastMeetings = OneOnOneMeeting::where('manager_id', $currentUser->id)
            ->where('direct_report_node_id', $orgNode->id)
            ->where('status', '!=', OneOnOneMeeting::STATUS_SCHEDULED)
            ->with(['actionItems.owner'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate(5);

        return Inertia::render('oneoneonemeetings/meetinghub', [
            'orgNode' => $orgNode,
            'upcomingMeeting' => $upcomingMeeting,
            'pastMeetings' => $pastMeetings
        ]);
    }

    /**
     * Show the form for creating a new meeting.
     */
    public function create(Request $request, OrgNode $orgNode)
    {
        $this->authorize('view', $orgNode);

        $currentUser = auth()->user();

        // Get incomplete action items from previous meetings
        $incompleteActionItems = OneOnOneActionItem::whereHas('meeting', function ($query) use ($currentUser, $orgNode) {
            $query->where('manager_id', $currentUser->id)
                  ->where('direct_report_node_id', $orgNode->id); // Changed from direct_report_id to direct_report_node_id
        })->incomplete()->with('owner')->get();

        // Get goals and initiatives for this direct report
        $goals = Goal::where('org_node_id', $orgNode->id)
            ->get();

        $initiatives = Initiative::whereHas('assignees', function ($query) use ($orgNode) {
            $query->where('org_nodes.id', $orgNode->id);
        })->get();

        return Inertia::render('oneoneonemeetings/meetingform', [
            'orgNode' => $orgNode,
            'incompleteActionItems' => $incompleteActionItems,
            'goals' => $goals,
            'initiatives' => $initiatives,
        ]);
    }

    /**
     * Store a newly created meeting.
     */
    public function store(Request $request, OrgNode $orgNode)
    {
        $this->authorize('view', $orgNode);

        $validated = $request->validate([
            'scheduled_at' => 'required|date',
            'agenda' => 'nullable|string',
            'private_notes' => 'nullable|string',
            'shared_notes' => 'nullable|string',
            'location' => 'nullable|string',
            'action_items' => 'nullable|array',
            'goal_ids' => 'nullable|array',
            'initiative_ids' => 'nullable|array',
        ]);

        $currentUser = auth()->user();

        // Create the meeting
        $meeting = OneOnOneMeeting::create([
            'manager_id' => $currentUser->id,
            'direct_report_node_id' => $orgNode->id, // Changed from direct_report_id to direct_report_node_id
            'scheduled_at' => $validated['scheduled_at'],
            'status' => OneOnOneMeeting::STATUS_SCHEDULED,
            'agenda' => $validated['agenda'] ?? null,
            'private_notes' => $validated['private_notes'] ?? null,
            'shared_notes' => $validated['shared_notes'] ?? null,
            'location' => $validated['location'] ?? null,
        ]);

        // Add action items
        if (isset($validated['action_items']) && count($validated['action_items']) > 0) {
            foreach ($validated['action_items'] as $actionItem) {
                $meeting->actionItems()->create([
                    'description' => $actionItem['description'],
                    'owner_id' => $actionItem['owner_id'],
                    'due_date' => $actionItem['due_date'] ?? null,
                    'completed' => false,
                ]);
            }
        }

        // Add related goals
        if (isset($validated['goal_ids']) && count($validated['goal_ids']) > 0) {
            $meeting->goals()->attach($validated['goal_ids']);
        }

        // Add related initiatives
        if (isset($validated['initiative_ids']) && count($validated['initiative_ids']) > 0) {
            $meeting->initiatives()->attach($validated['initiative_ids']);
        }

        return redirect()->route('one-on-one.index', $orgNode->id)
            ->with('success', '1:1 Meeting scheduled successfully.');
    }

    /**
     * Display the specified meeting.
     */
    public function show(Request $request, OrgNode $orgNode, OneOnOneMeeting $meeting)
    {
        $this->authorize('view', $orgNode);
        $this->authorize('view', $meeting);

        $meeting->load(['actionItems.owner', 'goals', 'initiatives']);

        return Inertia::render('oneoneonemeetings/meetingdetail', [
            'orgNode' => $orgNode,
            'meeting' => $meeting,
        ]);
    }

    /**
     * Show the form for editing a meeting.
     */
    public function edit(Request $request, OrgNode $orgNode, OneOnOneMeeting $meeting)
    {
        $this->authorize('view', $orgNode);
        $this->authorize('update', $meeting);

        $meeting->load(['actionItems.owner', 'goals', 'initiatives']);

        // Get goals and initiatives for this direct report
        $goals = Goal::where('org_node_id', $orgNode->id)
            ->get();

        $initiatives = Initiative::whereHas('assignees', function ($query) use ($orgNode) {
            $query->where('org_nodes.id', $orgNode->id);
        })->get();

        return Inertia::render('oneoneonemeetings/meetingform', [
            'orgNode' => $orgNode,
            'meeting' => $meeting,
            'goals' => $goals,
            'initiatives' => $initiatives,
            'isEditing' => true,
        ]);
    }

    /**
     * Update the specified meeting.
     */
    public function update(Request $request, OrgNode $orgNode, OneOnOneMeeting $meeting)
    {
        $this->authorize('view', $orgNode);
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'scheduled_at' => 'required|date',
            'agenda' => 'nullable|string',
            'private_notes' => 'nullable|string',
            'shared_notes' => 'nullable|string',
            'summary' => 'nullable|string',
            'location' => 'nullable|string',
            'status' => 'nullable|string|in:scheduled,completed,cancelled',
            'action_items' => 'nullable|array',
            'goal_ids' => 'nullable|array',
            'initiative_ids' => 'nullable|array',
        ]);

        // Update the meeting
        $meeting->update([
            'scheduled_at' => $validated['scheduled_at'],
            'agenda' => $validated['agenda'] ?? null,
            'private_notes' => $validated['private_notes'] ?? null,
            'shared_notes' => $validated['shared_notes'] ?? null,
            'summary' => $validated['summary'] ?? null,
            'location' => $validated['location'] ?? null,
            'status' => $validated['status'] ?? $meeting->status,
            'completed_at' => $validated['status'] === OneOnOneMeeting::STATUS_COMPLETED ? now() : $meeting->completed_at,
        ]);

        // Update action items (delete existing and create new ones)
        if (isset($validated['action_items'])) {
            // Delete existing action items
            $meeting->actionItems()->delete();

            // Add new action items
            foreach ($validated['action_items'] as $actionItem) {
                $meeting->actionItems()->create([
                    'description' => $actionItem['description'],
                    'owner_id' => $actionItem['owner_id'],
                    'due_date' => $actionItem['due_date'] ?? null,
                    'completed' => $actionItem['completed'] ?? false,
                ]);
            }
        }

        // Update related goals
        if (isset($validated['goal_ids'])) {
            $meeting->goals()->sync($validated['goal_ids']);
        }

        // Update related initiatives
        if (isset($validated['initiative_ids'])) {
            $meeting->initiatives()->sync($validated['initiative_ids']);
        }

        return redirect()->route('one-on-one.index', $orgNode->id)
            ->with('success', '1:1 Meeting updated successfully.');
    }

    /**
     * Complete a meeting.
     */
    public function complete(Request $request, OrgNode $orgNode, OneOnOneMeeting $meeting)
    {
        $this->authorize('view', $orgNode);
        $this->authorize('update', $meeting);

        $validated = $request->validate([
            'summary' => 'nullable|string',
            'shared_notes' => 'nullable|string',
            'action_items' => 'nullable|array',
        ]);

        // Update the meeting
        $meeting->update([
            'status' => OneOnOneMeeting::STATUS_COMPLETED,
            'completed_at' => now(),
            'summary' => $validated['summary'] ?? null,
            'shared_notes' => $validated['shared_notes'] ?? $meeting->shared_notes,
        ]);

        // Update action items status if provided
        if (isset($validated['action_items'])) {
            foreach ($validated['action_items'] as $actionItemData) {
                $actionItem = OneOnOneActionItem::find($actionItemData['id']);
                if ($actionItem) {
                    $actionItem->update([
                        'completed' => $actionItemData['completed'] ?? false,
                    ]);
                }
            }
        }

        return redirect()->route('one-on-one.index', $orgNode->id)
            ->with('success', '1:1 Meeting completed successfully.');
    }

    /**
     * Cancel a meeting.
     */
    public function cancel(Request $request, OrgNode $orgNode, OneOnOneMeeting $meeting)
    {
        $this->authorize('view', $orgNode);
        $this->authorize('update', $meeting);

        $meeting->update([
            'status' => OneOnOneMeeting::STATUS_CANCELLED,
        ]);

        return redirect()->route('one-on-one.index', $orgNode->id)
            ->with('success', '1:1 Meeting cancelled successfully.');
    }
}

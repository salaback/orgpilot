<?php
namespace App\Http\Controllers;

use App\Models\Initiative;
use App\Models\OrgStructure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class InitiativeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $initiatives = Initiative::all();
        return response()->json($initiatives);
    }

    public function show($id): JsonResponse
    {
        $initiative = Initiative::findOrFail($id);
        return response()->json($initiative);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'tags' => 'array',
            'tags.*' => 'string', // Validate each tag ID is a string
            'assignees' => 'array',
            'assignees.*' => 'integer|exists:org_nodes,id', // Validate each assignee ID exists
            'due_date' => 'nullable|date',
            'dueDate' => 'nullable|date', // Accept both field names
            'org_structure_id' => 'required|integer|exists:org_structures,id',
        ]);

        // Validate that the org_structure_id belongs to the current user
        $org = OrgStructure::where('id', $data['org_structure_id'])
            ->where('user_id', Auth::id())
            ->first();
        if (!$org) {
            return redirect()->back()->withErrors(['org_structure_id' => 'Unauthorized org structure.']);
        }

        // Extract tags and assignees from the data
        $tags = $data['tags'] ?? [];
        $assignees = $data['assignees'] ?? [];

        // Handle due date field name variations
        if (isset($data['dueDate']) && !isset($data['due_date'])) {
            $data['end_date'] = $data['dueDate'];
        } elseif (isset($data['due_date'])) {
            $data['end_date'] = $data['due_date'];
        }

        // Remove tags, assignees, and dueDate from data before creating the initiative
        unset($data['tags'], $data['assignees'], $data['dueDate'], $data['due_date']);

        $initiative = Initiative::create($data);

        // Attach tags to the newly created initiative
        if (!empty($tags)) {
            $initiative->tags()->attach($tags);
        }

        // Attach assignees to the newly created initiative
        if (!empty($assignees)) {
            $initiative->assignees()->attach($assignees);
        }

        // Return an Inertia redirect instead of JSON
        return redirect()->route('initiatives')->with('success', 'Initiative created!');
    }

    public function update(Request $request, $id)
    {
        $initiative = Initiative::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'tags' => 'array',
            'tags.*' => 'string', // Validate each tag ID is a string
            'assignees' => 'array',
            'assignees.*' => 'integer|exists:org_nodes,id', // Validate each assignee ID exists
            'due_date' => 'nullable|date',
            'dueDate' => 'nullable|date', // Accept both field names
            // Add other fields as needed
        ]);

        // Extract tags and assignees from the data
        $tags = $data['tags'] ?? [];
        $assignees = $data['assignees'] ?? [];

        // Handle due date field name variations
        if (isset($data['dueDate']) && !isset($data['due_date'])) {
            $data['end_date'] = $data['dueDate'];
        } elseif (isset($data['due_date'])) {
            $data['end_date'] = $data['due_date'];
        }

        // Remove tags, assignees, and dueDate from data before updating the initiative
        unset($data['tags'], $data['assignees'], $data['dueDate'], $data['due_date']);

        // Update the initiative basic fields
        $initiative->update($data);

        // Sync tags (this will add/remove tags as needed)
        if (!empty($tags)) {
            $initiative->tags()->sync($tags);
        } else {
            $initiative->tags()->detach(); // Remove all tags if none provided
        }

        // Sync assignees (this will add/remove assignees as needed)
        if (!empty($assignees)) {
            $initiative->assignees()->sync($assignees);
        } else {
            $initiative->assignees()->detach(); // Remove all assignees if none provided
        }

        // Return an Inertia redirect instead of JSON
        return redirect()->route('initiatives')->with('success', 'Initiative updated!');
    }

    public function destroy($id): JsonResponse
    {
        $initiative = Initiative::findOrFail($id);
        $initiative->delete();
        return response()->json(['success' => true]);
    }
}

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
            'due_date' => 'nullable|date',
            'org_structure_id' => 'required|integer|exists:org_structures,id',
            // Add other fields as needed
        ]);

        // Validate that the org_structure_id belongs to the current user
        $org = OrgStructure::where('id', $data['org_structure_id'])
            ->where('user_id', Auth::id())
            ->first();
        if (!$org) {
            return redirect()->back()->withErrors(['org_structure_id' => 'Unauthorized org structure.']);
        }

        $initiative = Initiative::create($data);
        // Return an Inertia redirect instead of JSON
        return redirect()->route('initiatives')->with('success', 'Initiative created!');
    }

    public function update(Request $request, $id): JsonResponse
    {
        $initiative = Initiative::findOrFail($id);
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'tags' => 'array',
            'due_date' => 'nullable|date',
            // Add other fields as needed
        ]);
        $initiative->update($data);
        return response()->json($initiative);
    }

    public function destroy($id): JsonResponse
    {
        $initiative = Initiative::findOrFail($id);
        $initiative->delete();
        return response()->json(['success' => true]);
    }
}

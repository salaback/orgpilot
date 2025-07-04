<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\OrgStructure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    /**
     * Display the user's organization.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Get the user's primary org structure or create one if it doesn't exist
        $orgStructure = $this->getOrCreatePrimaryOrgStructure($user);

        // Get the root node (the user themselves) or create one if it doesn't exist
        $rootNode = $this->getOrCreateRootNode($orgStructure, $user);

        // Get direct reports ONLY (no nested direct reports)
        $directReports = $rootNode->directReports()
            ->withCount('directReports')
            ->get();

        return Inertia::render('organisation/index', [
            'orgStructure' => $orgStructure,
            'rootNode' => $rootNode,
            'directReports' => $directReports,
        ]);
    }

    /**
     * Store a new direct report.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeDirectReport(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'manager_id' => 'required|exists:employees,id',
            'status' => 'nullable|in:' . implode(',', [Employee::STATUS_ACTIVE, Employee::STATUS_OPEN]),
            'node_type' => 'nullable|in:' . implode(',', [Employee::TYPE_PERSON, Employee::TYPE_PLACEHOLDER]),
        ]);

        // Get the manager node
        $managerNode = Employee::findOrFail($validated['manager_id']);

        // Check if the user has access to this org structure
        $user = Auth::user();
        $orgStructure = $managerNode->orgStructure;

        if ($orgStructure->user_id !== $user->id) {
            return back()->withErrors(['error' => 'You do not have permission to modify this organization.']);
        }

        // Create the new direct report
        $employee = new Employee([
            'org_structure_id' => $orgStructure->id,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'title' => $validated['title'],
            'email' => $validated['email'] ?? null,
            'status' => $validated['status'] ?? Employee::STATUS_ACTIVE,
            'node_type' => $validated['node_type'] ?? Employee::TYPE_PERSON,
            'manager_id' => $managerNode->id,
        ]);

        $employee->save();

        return back()->with('success', 'Direct report added successfully.');
    }

    /**
     * Get the user's primary org structure or create one if it doesn't exist.
     *
     * @param  \App\Models\User  $user
     * @return \App\Models\OrgStructure
     */
    private function getOrCreatePrimaryOrgStructure($user)
    {
        $orgStructure = OrgStructure::where('user_id', $user->id)
            ->where('is_primary', true)
            ->first();

        if (!$orgStructure) {
            $orgStructure = new OrgStructure([
                'user_id' => $user->id,
                'name' => $user->name . "'s Organization",
                'description' => 'Primary organization structure',
                'is_primary' => true,
            ]);

            $orgStructure->save();
        }

        return $orgStructure;
    }

    /**
     * Get the root node or create one if it doesn't exist.
     *
     * @param  \App\Models\OrgStructure  $orgStructure
     * @param  \App\Models\User  $user
     * @return \App\Models\Employee
     */
    private function getOrCreateRootNode($orgStructure, $user)
    {
        $rootNode = $orgStructure->rootNodes()->first();

        if (!$rootNode) {
            $rootNode = new Employee([
                'org_structure_id' => $orgStructure->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'title' => 'Manager', // Default title
                'email' => $user->email,
                'status' => Employee::STATUS_ACTIVE,
                'node_type' => Employee::TYPE_PERSON,
            ]);

            $rootNode->save();
        }

        return $rootNode;
    }

    /**
     * Get direct reports for a specific node.
     *
     * @param int $nodeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getNodeDirectReports($nodeId)
    {
        $user = Auth::user();
        $node = Employee::with('manager')->findOrFail($nodeId);
        $orgStructure = $node->orgStructure;

        // Check if the user has access to this org structure
        if ($orgStructure->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $directReports = $node->directReports()
            ->withCount('directReports')
            ->get();

        return response()->json([
            'directReports' => $directReports
        ]);
    }

    /**
     * Display the view for a specific node.
     *
     * @param int $nodeId
     * @return \Inertia\Response
     */
    public function viewNode($nodeId)
    {
        $user = Auth::user();
        $node = Employee::with('manager')->findOrFail($nodeId);
        $orgStructure = $node->orgStructure;

        // Check if the user has access to this org structure
        if ($orgStructure->user_id !== $user->id) {
            abort(403);
        }

        // Redirect to the profile page instead of rendering a non-existent view
        return redirect()->route('organisation.profile', $nodeId);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\OrgNode;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrgNodeProfileController extends Controller
{
    /**
     * Display the profile details of an OrgNode.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function show($id)
    {
        $orgNode = OrgNode::with([
            'manager',
            'directReports',
            'tasks' => function($query) {
                $query->orderBy('tasks.due_date', 'asc')->take(5);
            },
            'initiatives' => function($query) {
                $query->orderBy('initiatives.created_at', 'desc')->take(5);
            },
            'tags'
        ])->findOrFail($id);

        // Get notes related to this person
        $notes = \App\Models\Note::where('notable_type', 'App\\Models\\OrgNode')
            ->where('notable_id', $id)
            ->with('tags')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('OrgNodes/Profile', [
            'orgNode' => $orgNode,
            'notes' => $notes,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeProfileController extends Controller
{
    /**
     * Display the profile details of an Employee.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function show($id)
    {
        $employee = Employee::with([
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

        // Get notes related to this employee
        $notes = \App\Models\Note::where('notable_type', 'App\\Models\\Employee')
            ->where('notable_id', $id)
            ->with('tags')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Employees/Profile', [
            'employee' => $employee,
            'notes' => $notes,
        ]);
    }
}

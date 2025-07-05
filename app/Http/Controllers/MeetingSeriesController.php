<?php

namespace App\Http\Controllers;

use App\Models\MeetingSeries;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MeetingSeriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $meetingSeries = MeetingSeries::with(['createdBy', 'meetings'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Meetings/MeetingSeries/Index', [
            'meetingSeries' => $meetingSeries
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Meetings/MeetingSeries/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $meetingSeries = MeetingSeries::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('meeting-series.show', $meetingSeries)
            ->with('success', 'Meeting series created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(MeetingSeries $meetingSeries)
    {
        $meetingSeries->load([
            'meetings' => function ($query) {
                $query->with(['createdBy', 'participants', 'tasks', 'tags', 'initiatives'])
                    ->orderBy('meeting_time', 'desc');
            },
            'createdBy'
        ]);

        return Inertia::render('Meetings/MeetingSeries/Show', [
            'meetingSeries' => $meetingSeries
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MeetingSeries $meetingSeries)
    {
        return Inertia::render('Meetings/MeetingSeries/Edit', [
            'meetingSeries' => $meetingSeries
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MeetingSeries $meetingSeries)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $meetingSeries->update($validated);

        return redirect()->route('meeting-series.show', $meetingSeries)
            ->with('success', 'Meeting series updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MeetingSeries $meetingSeries)
    {
        $meetingSeries->delete();

        return redirect()->route('meeting-series.index')
            ->with('success', 'Meeting series deleted successfully.');
    }
}

<?php

use App\Http\Controllers\InitiativeController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
    'ensure.profile.complete',  // Apply profile completion check to all authenticated routes
])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Organisation routes
    Route::get('organisation', [OrganizationController::class, 'index'])->name('organisation');
    Route::get('organisation/person/{nodeId}', [OrganizationController::class, 'viewNode'])->name('organisation.person');
    Route::get('organisation/profile/{id}', [\App\Http\Controllers\EmployeeProfileController::class, 'show'])->name('organisation.profile');
    Route::post('organisation/direct-report', [OrganizationController::class, 'storeDirectReport'])->name('organisation.direct-report.store');
    Route::get('organisation/person/{nodeId}/direct-reports', [OrganizationController::class, 'getNodeDirectReports'])->name('organisation.person.direct-reports');

    // 1:1 Meeting routes
    Route::prefix('organisation/profile/{employee}/one-on-one')->name('one-on-one.')->group(function () {
        Route::get('/', [\App\Http\Controllers\OneOnOneMeetingController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\OneOnOneMeetingController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\OneOnOneMeetingController::class, 'store'])->name('store');
        Route::get('/{meeting}', [\App\Http\Controllers\OneOnOneMeetingController::class, 'show'])->name('show');
        Route::get('/{meeting}/edit', [\App\Http\Controllers\OneOnOneMeetingController::class, 'edit'])->name('edit');
        Route::put('/{meeting}', [\App\Http\Controllers\OneOnOneMeetingController::class, 'update'])->name('update');
        Route::post('/{meeting}/complete', [\App\Http\Controllers\OneOnOneMeetingController::class, 'complete'])->name('complete');
        Route::post('/{meeting}/cancel', [\App\Http\Controllers\OneOnOneMeetingController::class, 'cancel'])->name('cancel');
    });

    // Meeting routes
    Route::resource('meeting-series', \App\Http\Controllers\MeetingSeriesController::class);
    Route::resource('meetings', \App\Http\Controllers\MeetingController::class);
    Route::post('meetings/{meeting}/tasks', [\App\Http\Controllers\MeetingController::class, 'createTask'])->name('meetings.tasks.store');

    Route::get('initiatives', function () {
        $initiatives = \App\Models\Initiative::with(['assignees', 'tags'])
            ->orderBy('status')
            ->orderBy('order')
            ->get()->map(function ($initiative) {
            return [
                'id' => $initiative->id,
                'title' => $initiative->title,
                'description' => $initiative->description,
                'status' => $initiative->status,
                'order' => $initiative->order,
                'due_date' => $initiative->end_date,
                'dueDate' => $initiative->end_date,
                'assignees' => $initiative->assignees->pluck('id')->toArray(),
                'tags' => $initiative->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ];
                })->toArray(),
                'teamLabel' => $initiative->teamLabel ?? '',
                'allocations' => $initiative->allocations ?? [],
                'created_at' => $initiative->created_at,
                'updated_at' => $initiative->updated_at,
            ];
        });
        $employees = \App\Models\Employee::where('node_type', 'person')->where('status', 'active')->get(['id', 'first_name', 'last_name', 'email', 'title']);
        $defaultOrg = \App\Models\OrgStructure::where('user_id', auth()->id())->orderBy('id')->first();
        return Inertia::render('initiatives', [
            'initiatives' => $initiatives,
            'assignees' => $employees,
            'default_org_structure_id' => $defaultOrg ? $defaultOrg->id : null,
        ]);
    })->name('initiatives');

    Route::get('initiatives/{initiative}', function (\App\Models\Initiative $initiative) {
        $initiative->load(['assignees', 'tags']);

        $initiativeData = [
            'id' => $initiative->id,
            'title' => $initiative->title,
            'description' => $initiative->description,
            'status' => $initiative->status,
            'order' => $initiative->order,
            'due_date' => $initiative->end_date,
            'dueDate' => $initiative->end_date,
            'assignees' => $initiative->assignees->pluck('id')->toArray(),
            'tags' => $initiative->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            })->toArray(),
            'teamLabel' => $initiative->teamLabel ?? '',
            'allocations' => $initiative->allocations ?? [],
            'created_at' => $initiative->created_at,
            'updated_at' => $initiative->updated_at,
        ];

        $employees = \App\Models\Employee::where('node_type', 'person')->where('status', 'active')->get(['id', 'first_name', 'last_name', 'email', 'title']);

        // Load notes for this initiative with their tags
        $notes = \App\Models\Note::where('notable_type', 'App\\Models\\Initiative')
            ->where('notable_id', $initiative->id)
            ->with('tags')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'title' => $note->title,
                    'content' => $note->content,
                    'created_at' => $note->created_at,
                    'updated_at' => $note->updated_at,
                    'tags' => $note->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                    ];
                })->toArray(),
                ];
            });

        return Inertia::render('initiative', [
            'initiative' => $initiativeData,
            'assignees' => $employees,
            'notes' => $notes,
        ]);
    })->name('initiative.show');

    // Tag API endpoints
    Route::get('api/tags', [TagController::class, 'index']);
    Route::post('api/tags', [TagController::class, 'store']);
    Route::get('api/tags/{type}/{id}', [TagController::class, 'show']);
    Route::post('api/tags/{type}/{id}/attach', [TagController::class, 'attach']);
    Route::post('api/tags/{type}/{id}/detach', [TagController::class, 'detach']);

    // Notes API endpoints
    Route::get('api/notes', [\App\Http\Controllers\Api\NoteController::class, 'index']);
    Route::post('api/notes', [\App\Http\Controllers\Api\NoteController::class, 'store']);
    Route::get('api/notes/{note}', [\App\Http\Controllers\Api\NoteController::class, 'show']);
    Route::put('api/notes/{note}', [\App\Http\Controllers\Api\NoteController::class, 'update']);
    Route::delete('api/notes/{note}', [\App\Http\Controllers\Api\NoteController::class, 'destroy']);

    // Notes creation route for Inertia
    Route::post('initiatives/{initiative}/notes', function (\App\Models\Initiative $initiative, \Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'mentions' => 'nullable|array',
        ]);

        // Manually validate and filter mentions to ensure only valid numeric IDs
        $mentionIds = [];
        if (!empty($validated['mentions'])) {
            foreach ($validated['mentions'] as $mention) {
                if (is_numeric($mention)) {
                    $mentionId = (int) $mention;
                    // Check if this ID exists in org_nodes table
                    if (\App\Models\Employee::where('id', $mentionId)->exists()) {
                        $mentionIds[] = $mentionId;
                    }
                }
            }
        }

        $note = \App\Models\Note::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'notable_type' => 'App\\Models\\Initiative',
            'notable_id' => $initiative->id,
        ]);

        // Process and attach tags if they exist
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                // Create or find the tag
                $tag = \App\Models\Tag::firstOrCreate(['name' => $tagName]);
                $tagIds[] = $tag->id;
            }

            // Attach tags to the note using the polymorphic relationship
            $note->tags()->attach($tagIds);
        }

        // Process and store mentions if they exist
        if (!empty($mentionIds)) {
            // You can store mentions in a separate table or as metadata
            // For now, we'll just log them or handle them as needed
            \Log::info('Note mentions: ', $mentionIds);
        }

        return redirect()->route('initiative.show', $initiative)->with('success', 'Note created successfully');
    })->name('initiative.notes.store');

    // Initiative API resource routes
    Route::apiResource('api/initiatives', InitiativeController::class);

    // Task routes
    Route::resource('tasks', TaskController::class);
    Route::get('organisation/profile/{id}/tasks', [TaskController::class, 'profileTasks'])->name('organisation.profile.tasks');
    Route::patch('tasks/{task}/progress', [TaskController::class, 'updateProgress'])->name('tasks.update-progress');
    Route::get('tasks-overdue', [TaskController::class, 'overdue'])->name('tasks.overdue');
    Route::get('tasks-due-soon', [TaskController::class, 'dueSoon'])->name('tasks.due-soon');
    Route::get('api/initiatives/{initiative}/tasks', [TaskController::class, 'forInitiative'])->name('api.initiatives.tasks');

    // Task Management routes
    Route::prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->name('index');
        Route::post('/', [TaskController::class, 'store'])->name('store');
        Route::get('/statistics', [TaskController::class, 'statistics'])->name('statistics');
        Route::patch('/bulk-update', [TaskController::class, 'bulkUpdate'])->name('bulk-update');
        Route::get('/{task}', [TaskController::class, 'show'])->name('show');
        Route::patch('/{task}', [TaskController::class, 'update'])->name('update');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
        Route::patch('/{task}/progress', [TaskController::class, 'updateProgress'])->name('update-progress');
    });

    // Test route to verify Inertia page resolution
    Route::get('test-page', function() {
        return Inertia::render('test-page');
    });

    // Task notes creation route
    Route::post('tasks/{task}/notes', function (\App\Models\Task $task, \Illuminate\Http\Request $request) {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $note = \App\Models\Note::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'notable_type' => 'App\\Models\\Task',
            'notable_id' => $task->id,
        ]);

        // Process and attach tags if they exist
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = \App\Models\Tag::firstOrCreate(['name' => $tagName]);
                $tagIds[] = $tag->id;
            }
            $note->tags()->attach($tagIds);
        }

        return redirect()->route('tasks.show', $task)->with('success', 'Note created successfully');
    })->name('task.notes.store');

    // Initiative profile route
    Route::get('organisation/profile/{id}/initiatives', [InitiativeController::class, 'profileInitiatives'])->name('organisation.profile.initiatives');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

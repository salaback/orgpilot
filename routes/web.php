<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InitiativeController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
    'ensure.profile.complete',  // Apply profile completion check to all authenticated routes
])->group(function () {
    Route::get('dashboard', [HomeController::class, 'dashboard'])->name('dashboard');

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

    // Initiative routes
    Route::get('initiatives', [InitiativeController::class, 'webIndex'])->name('initiatives');
    Route::get('initiatives/{initiative}', [InitiativeController::class, 'webShow'])->name('initiative.show');

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

    // Notes creation routes
    Route::post('initiatives/{initiative}/notes', [NoteController::class, 'storeForInitiative'])->name('initiative.notes.store');
    Route::post('tasks/{task}/notes', [NoteController::class, 'storeForTask'])->name('task.notes.store');

    // Initiative API resource routes
    Route::apiResource('api/initiatives', InitiativeController::class);

    // Task routes
    Route::resource('tasks', TaskController::class);
    Route::get('organisation/profile/{id}/tasks', [TaskController::class, 'profileTasks'])->name('organisation.profile.tasks');
    Route::get('organisation/profile/{id}/initiatives', [InitiativeController::class, 'profileInitiatives'])->name('organisation.profile.initiatives');
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

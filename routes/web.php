<?php

use App\Http\Controllers\InitiativeController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\WorkOS\Http\Middleware\ValidateSessionWithWorkOS;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware([
    'auth',
    ValidateSessionWithWorkOS::class,
])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Organisation routes
    Route::get('organisation', [OrganizationController::class, 'index'])->name('organisation');
    Route::get('organisation/person/{nodeId}', [OrganizationController::class, 'viewNode'])->name('organisation.person');
    Route::post('organisation/direct-report', [OrganizationController::class, 'storeDirectReport'])->name('organisation.direct-report.store');
    Route::get('organisation/person/{nodeId}/direct-reports', [OrganizationController::class, 'getNodeDirectReports'])->name('organisation.person.direct-reports');

    Route::get('initiatives', function () {
        $initiatives = \App\Models\Initiative::with(['assignees', 'tags'])->get()->map(function ($initiative) {
            return [
                'id' => $initiative->id,
                'title' => $initiative->title,
                'description' => $initiative->description,
                'status' => $initiative->status,
                'due_date' => $initiative->end_date,
                'dueDate' => $initiative->end_date,
                'assignees' => $initiative->assignees->pluck('id')->toArray(),
                'tags' => $initiative->tags->pluck('id')->map('strval')->toArray(),
                'teamLabel' => $initiative->teamLabel ?? '',
                'allocations' => $initiative->allocations ?? [],
                'created_at' => $initiative->created_at,
                'updated_at' => $initiative->updated_at,
            ];
        });
        $orgNodes = \App\Models\OrgNode::where('node_type', 'person')->where('status', 'active')->get(['id', 'first_name', 'last_name', 'email', 'title']);
        $defaultOrg = \App\Models\OrgStructure::where('user_id', auth()->id())->orderBy('id')->first();
        return Inertia::render('initiatives', [
            'initiatives' => $initiatives,
            'assignees' => $orgNodes,
            'default_org_structure_id' => $defaultOrg ? $defaultOrg->id : null,
        ]);
    })->name('initiatives');

    // Tag API endpoints
    Route::get('api/tags', [TagController::class, 'index']);
    Route::post('api/tags', [TagController::class, 'store']);
    Route::get('api/tags/{type}/{id}', [TagController::class, 'show']);
    Route::post('api/tags/{type}/{id}/attach', [TagController::class, 'attach']);
    Route::post('api/tags/{type}/{id}/detach', [TagController::class, 'detach']);

    // Initiative API resource routes
    Route::apiResource('api/initiatives', InitiativeController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

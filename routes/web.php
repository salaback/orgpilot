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

    // Organization routes
    Route::get('organization', [OrganizationController::class, 'index'])->name('organization');
    Route::get('organization/person/{nodeId}', [OrganizationController::class, 'viewNode'])->name('organization.person');
    Route::post('organization/direct-report', [OrganizationController::class, 'storeDirectReport'])->name('organization.direct-report.store');
    Route::get('organization/person/{nodeId}/direct-reports', [OrganizationController::class, 'getNodeDirectReports'])->name('organization.person.direct-reports');

    Route::get('initiatives', function () {
        $initiatives = \App\Models\Initiative::all();
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

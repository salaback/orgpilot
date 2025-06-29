<?php

use App\Http\Controllers\OrganizationController;
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
    Route::post('organization/direct-report', [OrganizationController::class, 'storeDirectReport'])->name('organization.direct-report.store');
    Route::get('organization/node/{nodeId}/direct-reports', [OrganizationController::class, 'getNodeDirectReports'])->name('organization.node.direct-reports');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

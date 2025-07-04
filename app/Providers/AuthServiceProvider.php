<?php

namespace App\Providers;

use App\Models\Employee;
use App\Models\OneOnOneMeeting;
use App\Policies\EmployeePolicy;
use App\Policies\OneOnOneMeetingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        OneOnOneMeeting::class => OneOnOneMeetingPolicy::class,
        Employee::class => EmployeePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

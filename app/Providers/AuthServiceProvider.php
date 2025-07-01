<?php

namespace App\Providers;

use App\Models\OneOnOneMeeting;
use App\Models\OrgNode;
use App\Policies\OneOnOneMeetingPolicy;
use App\Policies\OrgNodePolicy;
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
        OrgNode::class => OrgNodePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

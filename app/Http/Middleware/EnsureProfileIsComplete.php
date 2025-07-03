<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Inertia\Inertia;

class EnsureProfileIsComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if the user has provided their first and last name
        if (empty($user->first_name) || empty($user->last_name)) {
            // If we're already on the profile completion page, let the request through
            if ($request->routeIs('profile.complete')) {
                return $next($request);
            }

            // Store the intended URL in the session
            session()->put('url.intended', $request->url());

            // Redirect to the profile completion page
            return redirect()->route('profile.complete');
        }

        return $next($request);
    }
}

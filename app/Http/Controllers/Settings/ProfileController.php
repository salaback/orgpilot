<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\WorkOS\Http\Requests\AuthKitAccountDeletionRequest;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Show the profile completion form.
     */
    public function complete(): Response
    {
        return Inertia::render('Profile/Complete', [
            'user' => auth()->user(),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(Request $request): RedirectResponse
    {
        // Check which fields were submitted - this handles both full profile updates
        // and the minimal first_name/last_name updates for profile completion
        $rules = [];

        if ($request->has('name')) {
            $rules['name'] = ['required', 'string', 'max:255'];
        }

        if ($request->has('first_name') || $request->has('last_name')) {
            $rules['first_name'] = ['required', 'string', 'max:255'];
            $rules['last_name'] = ['required', 'string', 'max:255'];
        }

        $validated = $request->validate($rules);
        $request->user()->update($validated);

        // If this was a profile completion request, redirect to the intended URL or dashboard
        if ($request->has('first_name') || $request->has('last_name')) {
            return redirect()->intended(route('dashboard'));
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(AuthKitAccountDeletionRequest $request): RedirectResponse
    {
        return $request->delete(
            using: fn (User $user) => $user->delete()
        );
    }
}

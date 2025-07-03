<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ProfileController extends Controller
{
    /**
     * Show the profile completion form.
     */
    public function complete()
    {
        return Inertia::render('Profile/Complete', [
            'user' => auth()->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->update($validated);

        return Redirect::intended(route('dashboard'));
    }
}

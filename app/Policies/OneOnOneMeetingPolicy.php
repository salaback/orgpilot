<?php

namespace App\Policies;

use App\Models\OneOnOneMeeting;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OneOnOneMeetingPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Anyone can view meetings list
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OneOnOneMeeting $oneOnOneMeeting): bool
    {
        // Only the manager who created the meeting or the direct report involved can view
        return $user->id === $oneOnOneMeeting->manager_id ||
               $user->id === $oneOnOneMeeting->direct_report_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create a meeting
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OneOnOneMeeting $oneOnOneMeeting): bool
    {
        // Only the manager who created the meeting can update it
        return $user->id === $oneOnOneMeeting->manager_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OneOnOneMeeting $oneOnOneMeeting): bool
    {
        // Only the manager who created the meeting can delete it
        return $user->id === $oneOnOneMeeting->manager_id;
    }
}

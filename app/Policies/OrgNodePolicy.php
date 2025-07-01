<?php

namespace App\Policies;

use App\Models\OrgNode;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrgNodePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Any authenticated user can view the list of org nodes
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OrgNode $orgNode): bool
    {
        // For now, any authenticated user can view any org node
        // In a real application, you might want to restrict this based on role or relationship
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create an org node
        // In a real application, you might want to restrict this to admins or managers
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OrgNode $orgNode): bool
    {
        // For now, any authenticated user can update any org node
        // In a real application, you might want to restrict this to admins or the manager of the node
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OrgNode $orgNode): bool
    {
        // For now, any authenticated user can delete any org node
        // In a real application, you might want to restrict this to admins or the manager of the node
        return true;
    }
}

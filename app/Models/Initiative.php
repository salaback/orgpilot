<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Initiative extends Model
{
    use HasFactory;

    /**
     * Initiative status constants
     */
    const STATUS_PLANNED = 'planned';
    const STATUS_IN_PROGRESS = 'in-progress';
    const STATUS_COMPLETE = 'complete';
    const STATUS_ON_HOLD = 'on-hold';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'org_structure_id',
        'title',
        'description',
        'status',
        'order',
        'start_date',
        'end_date',
        'owner_employee_id',
        'linked_goals',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'linked_goals' => 'array',
    ];

    /**
     * Scope a query to only include active initiatives (not complete or cancelled).
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETE, self::STATUS_CANCELLED]);
    }

    /**
     * Get the organization structure this initiative belongs to.
     */
    public function orgStructure(): BelongsTo
    {
        return $this->belongsTo(OrgStructure::class);
    }

    /**
     * Get the owner of this initiative.
     */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class);
    }

    /**
     * Get the goals linked to this initiative.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getLinkedGoals()
    {
        if (!$this->linked_goals) {
            return collect();
        }

        return Goal::whereIn('id', $this->linked_goals)->get();
    }

    /**
     * Link a goal to this initiative.
     *
     * @param int|Goal $goal The goal ID or Goal instance to link
     * @return bool Whether the operation was successful
     */
    public function linkGoal($goal): bool
    {
        $goalId = $goal instanceof Goal ? $goal->id : $goal;

        $linkedGoals = $this->linked_goals ?? [];

        if (!in_array($goalId, $linkedGoals)) {
            $linkedGoals[] = $goalId;
            $this->linked_goals = $linkedGoals;
            return $this->save();
        }

        return true;
    }

    /**
     * Unlink a goal from this initiative.
     *
     * @param int|Goal $goal The goal ID or Goal instance to unlink
     * @return bool Whether the operation was successful
     */
    public function unlinkGoal($goal): bool
    {
        $goalId = $goal instanceof Goal ? $goal->id : $goal;

        $linkedGoals = $this->linked_goals ?? [];

        if (($key = array_search($goalId, $linkedGoals)) !== false) {
            unset($linkedGoals[$key]);
            $this->linked_goals = array_values($linkedGoals); // Re-index array
            return $this->save();
        }

        return true;
    }

    /**
     * Check if a goal is linked to this initiative.
     *
     * @param int|Goal $goal The goal ID or Goal instance to check
     * @return bool Whether the goal is linked
     */
    public function hasLinkedGoal($goal): bool
    {
        $goalId = $goal instanceof Goal ? $goal->id : $goal;

        $linkedGoals = $this->linked_goals ?? [];

        return in_array($goalId, $linkedGoals);
    }

    /**
     * Tags polymorphic relationship
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Get all tasks for this initiative
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}

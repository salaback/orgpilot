<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Goal extends Model
{
    use HasFactory;

    /**
     * Goal type constants
     */
    const TYPE_PERFORMANCE = 'performance';
    const TYPE_DEVELOPMENT = 'development';
    const TYPE_PROJECT = 'project';

    /**
     * Goal status constants
     */
    const STATUS_NOT_STARTED = 'not-started';
    const STATUS_IN_PROGRESS = 'in-progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'node_id',
        'title',
        'goal_type',
        'metric',
        'status',
        'due_date',
        'private',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'date',
        'private' => 'boolean',
    ];

    /**
     * Get the node this goal belongs to.
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(OrgNode::class);
    }

    /**
     * Get initiatives linked to this goal.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function initiatives()
    {
        return Initiative::whereRaw("JSON_CONTAINS(linked_goals, '?')", [$this->id])->get();
    }

    /**
     * Check if this goal is linked to a specific initiative.
     *
     * @param int|Initiative $initiative The initiative ID or Initiative instance to check
     * @return bool Whether the goal is linked to the initiative
     */
    public function isLinkedToInitiative($initiative): bool
    {
        $initiativeId = $initiative instanceof Initiative ? $initiative->id : $initiative;

        $initiative = Initiative::find($initiativeId);

        return $initiative ? $initiative->hasLinkedGoal($this->id) : false;
    }

    /**
     * Check if this is a performance goal.
     */
    public function isPerformanceGoal(): bool
    {
        return $this->goal_type === self::TYPE_PERFORMANCE;
    }

    /**
     * Check if this is a development goal.
     */
    public function isDevelopmentGoal(): bool
    {
        return $this->goal_type === self::TYPE_DEVELOPMENT;
    }

    /**
     * Check if this is a project goal.
     */
    public function isProjectGoal(): bool
    {
        return $this->goal_type === self::TYPE_PROJECT;
    }

    /**
     * Check if this goal is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if this goal is in progress.
     */
    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if this goal is not started yet.
     */
    public function isNotStarted(): bool
    {
        return $this->status === self::STATUS_NOT_STARTED;
    }

    /**
     * Check if this goal is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Check if this goal is visible to others (not private).
     */
    public function isPublic(): bool
    {
        return !$this->private;
    }

    /**
     * Tags polymorphic relationship
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}

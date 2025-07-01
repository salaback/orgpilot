<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class OrgNode extends Model
{
    use HasFactory;

    /**
     * Node status constants
     */
    const STATUS_ACTIVE = 'active';
    const STATUS_OPEN = 'open';
    const STATUS_FORMER = 'former';

    /**
     * Node type constants
     */
    const TYPE_PERSON = 'person';
    const TYPE_PLACEHOLDER = 'placeholder';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'org_structure_id',
        'first_name',
        'last_name',
        'title',
        'email',
        'status',
        'node_type',
        'manager_id',
        'start_date',
        'end_date',
        'tags',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'tags' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['full_name'];

    /**
     * Get the full name attribute.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the organization structure this node belongs to.
     */
    public function orgStructure(): BelongsTo
    {
        return $this->belongsTo(OrgStructure::class);
    }

    /**
     * Get the manager of this node.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(OrgNode::class, 'manager_id');
    }

    /**
     * Get the direct reports (subordinates) of this node.
     */
    public function directReports(): HasMany
    {
        return $this->hasMany(OrgNode::class, 'manager_id');
    }

    /**
     * Get the goals associated with this node.
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class, 'node_id');
    }

    /**
     * Get the initiatives owned by this node.
     */
    public function ownedInitiatives(): HasMany
    {
        return $this->hasMany(Initiative::class, 'owner_node_id');
    }

    /**
     * Tags polymorphic relationship
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Get initiatives this node is assigned to.
     */
    public function initiatives()
    {
        return $this->belongsToMany(Initiative::class);
    }

    /**
     * Get tasks assigned to this node.
     */
    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    /**
     * Check if this node is a person.
     */
    public function isPerson(): bool
    {
        return $this->node_type === self::TYPE_PERSON;
    }

    /**
     * Check if this node is a placeholder.
     */
    public function isPlaceholder(): bool
    {
        return $this->node_type === self::TYPE_PLACEHOLDER;
    }

    /**
     * Check if this node is active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if this node is an open position.
     */
    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN;
    }

    /**
     * Check if this node is a former position/person.
     */
    public function isFormer(): bool
    {
        return $this->status === self::STATUS_FORMER;
    }

    /**
     * Get all ancestors (managers up the chain) for this node.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAncestors()
    {
        $ancestors = collect();
        $currentNode = $this;

        while ($currentNode->manager) {
            $ancestors->push($currentNode->manager);
            $currentNode = $currentNode->manager;
        }

        return $ancestors;
    }

    /**
     * Get all descendants (entire subtree) for this node.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAllDescendants()
    {
        $descendants = collect();

        // Add direct reports
        $directReports = $this->directReports;
        $descendants = $descendants->merge($directReports);

        // Recursively add descendants of each direct report
        foreach ($directReports as $report) {
            $descendants = $descendants->merge($report->getAllDescendants());
        }

        return $descendants;
    }

    /**
     * Get all tasks assigned to this org node
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Get all tasks created by this org node (if they have a user account)
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }
}

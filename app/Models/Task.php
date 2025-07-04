<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'initiative_id',
        'assigned_to',
        'created_by',
        'due_date',
        'percentage_complete',
        'priority',
        'status',
    ];

    protected $casts = [
        'due_date' => 'date',
        'percentage_complete' => 'integer',
    ];

    /**
     * Get the initiative that owns the task
     */
    public function initiative(): BelongsTo
    {
        return $this->belongsTo(Initiative::class);
    }

    /**
     * Get the employee assigned to this task
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }

    /**
     * Get the user who created this task
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all notes for this task
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'notable_id')->where('notable_type', self::class);
    }

    /**
     * Get all tags associated with this task
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Scope a query to only include tasks for a specific initiative
     */
    public function scopeForInitiative($query, $initiativeId)
    {
        return $query->where('initiative_id', $initiativeId);
    }

    /**
     * Scope a query to only include tasks assigned to a specific employee
     */
    public function scopeAssignedTo($query, $employeeId)
    {
        return $query->where('assigned_to', $employeeId);
    }

    /**
     * Scope a query to only include overdue tasks
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())->where('status', '!=', 'completed');
    }

    /**
     * Scope a query to only include tasks due soon (within 7 days)
     */
    public function scopeDueSoon($query)
    {
        return $query->whereBetween('due_date', [now(), now()->addDays(7)])->where('status', '!=', 'completed');
    }

    /**
     * Get the status color for display
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'not_started' => '#6c757d',
            'in_progress' => '#007bff',
            'completed' => '#28a745',
            'on_hold' => '#ffc107',
            'cancelled' => '#dc3545',
            default => '#6c757d',
        };
    }

    /**
     * Get the priority color for display
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => '#28a745',
            'medium' => '#ffc107',
            'high' => '#fd7e14',
            'urgent' => '#dc3545',
            default => '#ffc107',
        };
    }

    /**
     * Check if the task is overdue
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date && $this->due_date->isPast() && $this->status !== 'completed';
    }

    /**
     * Get the completion status as a percentage string
     */
    public function getCompletionStatusAttribute(): string
    {
        return $this->percentage_complete . '%';
    }
}

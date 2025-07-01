<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class OneOnOneMeeting extends Model
{
    use HasFactory;

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'manager_id',
        'direct_report_type',
        'direct_report_id',
        'scheduled_at',
        'completed_at',
        'status',
        'agenda',
        'private_notes',
        'shared_notes',
        'summary',
        'location',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the manager who scheduled the meeting.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the direct report for this meeting.
     * This can be any model type (OrgNode, User, etc.)
     */
    public function directReport(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the action items for this meeting.
     */
    public function actionItems(): HasMany
    {
        return $this->hasMany(OneOnOneActionItem::class);
    }

    /**
     * Get the goals related to this meeting.
     */
    public function goals(): BelongsToMany
    {
        return $this->belongsToMany(Goal::class, 'one_on_one_related_goals');
    }

    /**
     * Get the initiatives related to this meeting.
     */
    public function initiatives(): BelongsToMany
    {
        return $this->belongsToMany(Initiative::class, 'one_on_one_related_initiatives');
    }

    /**
     * Scope a query to only include upcoming meetings.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_at', '>=', now())
            ->where('status', self::STATUS_SCHEDULED)
            ->orderBy('scheduled_at', 'asc');
    }

    /**
     * Scope a query to only include past meetings.
     */
    public function scopePast($query)
    {
        return $query->where(function($q) {
            $q->where('status', self::STATUS_COMPLETED)
                ->orWhere('scheduled_at', '<', now());
        })->orderBy('scheduled_at', 'desc');
    }
}

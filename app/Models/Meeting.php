<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Meeting extends Model
{
    use HasFactory;

    // Meeting types
    const TYPE_ONE_ON_ONE = 'one_on_one';
    const TYPE_STEER_CO = 'steer_co';
    const TYPE_STANDUP = 'standup';
    const TYPE_PROJECT = 'project';
    const TYPE_REGULAR = 'regular';

    // Meeting statuses
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'title',
        'type',
        'agenda',
        'meeting_series_id',
        'meeting_time',
        'duration_minutes',
        'notes',
        'summary',
        'location',
        'status',
        'created_by',
    ];

    protected $casts = [
        'meeting_time' => 'datetime',
    ];

    /**
     * Get all available meeting types
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_ONE_ON_ONE => 'One-on-One',
            self::TYPE_STEER_CO => 'Steering Committee',
            self::TYPE_STANDUP => 'Standup',
            self::TYPE_PROJECT => 'Project',
            self::TYPE_REGULAR => 'Regular',
        ];
    }

    /**
     * Get the meeting series this meeting belongs to
     */
    public function meetingSeries(): BelongsTo
    {
        return $this->belongsTo(MeetingSeries::class);
    }

    /**
     * Get the user who created this meeting (for one-on-one meetings, this is the manager)
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the manager for this meeting (for one-on-one meetings)
     * This is an alias for createdBy for clarity
     */
    public function manager(): BelongsTo
    {
        return $this->createdBy();
    }

    /**
     * For one-on-one meetings, get the direct report
     * This is the first participant who isn't the creator
     */
    public function directReport()
    {
        if ($this->type !== self::TYPE_ONE_ON_ONE) {
            return null;
        }

        return $this->participants()
            ->where('users.id', '!=', $this->created_by)
            ->first();
    }

    /**
     * Get all tasks associated with this meeting
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get all action items associated with this meeting
     */
    public function actionItems(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the goals related to this meeting
     */
    public function goals(): BelongsToMany
    {
        return $this->belongsToMany(Goal::class, 'meeting_goals');
    }

    /**
     * Get the initiatives related to this meeting
     */
    public function initiatives(): BelongsToMany
    {
        return $this->belongsToMany(Initiative::class, 'meeting_initiatives');
    }

    /**
     * Get the tags associated with this meeting
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'meeting_tags');
    }

    /**
     * Scope a query to only include one-on-one meetings
     */
    public function scopeOneOnOne($query)
    {
        return $query->where('type', self::TYPE_ONE_ON_ONE);
    }

    /**
     * Scope a query to only include upcoming meetings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('meeting_time', '>=', now())
            ->where('status', self::STATUS_SCHEDULED)
            ->orderBy('meeting_time', 'asc');
    }

    /**
     * Get all participants (users) for this meeting
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'meeting_participants', 'meeting_id', 'participantable_id')
            ->where('meeting_participants.participantable_type', User::class);
    }

    /**
     * Get all external participants for this meeting
     */
    public function externalParticipants()
    {
        return $this->hasMany(MeetingParticipant::class)
            ->whereNotNull('external_participant_name');
    }

    /**
     * Get the previous meeting in the series
     */
    public function previousMeeting()
    {
        if (!$this->meeting_series_id) {
            return null;
        }

        return $this->meetingSeries->meetings()
            ->where('meeting_time', '<', $this->meeting_time)
            ->orderBy('meeting_time', 'desc')
            ->first();
    }

    /**
     * Helper method to check if this is a one-on-one meeting
     */
    public function isOneOnOne()
    {
        return $this->type === self::TYPE_ONE_ON_ONE;
    }

    /**
     * Helper method to set the direct report for a one-on-one meeting
     * This adds the user as a participant if they're not already
     */
    public function setDirectReport(User $user)
    {
        if (!$this->isOneOnOne()) {
            return false;
        }

        $this->participants()->syncWithoutDetaching([$user->id => [
            'participantable_type' => User::class,
            'role' => 'direct_report'
        ]]);

        return true;
    }

    /**
     * Get all meeting participant pivot records
     */
    public function meetingParticipants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MeetingParticipant::class);
    }

    /**
     * Get all notes associated with this meeting.
     */
    public function notes(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Note::class, 'notable');
    }

    /**
     * Stub: Get tasks from previous meeting (for test compatibility)
     * TODO: Implement this
     */
    public function tasksFromPreviousMeeting()
    {
        return [];
    }

    /**
     * Stub: Get completed tasks since previous meeting (for test compatibility)
     * TODO: Implement this
     */
    public function tasksCompletedSincePreviousMeeting()
    {
        return [];
    }

    /**
     * Stub: Get open tasks from series (for test compatibility)
     * TODO: Implement this
     */
    public function openTasksFromSeries()
    {
        return [];
    }
}

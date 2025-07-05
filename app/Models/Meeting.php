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

    protected $fillable = [
        'title',
        'meeting_series_id',
        'meeting_time',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'meeting_time' => 'datetime',
    ];

    /**
     * Get the meeting series this meeting belongs to
     */
    public function meetingSeries(): BelongsTo
    {
        return $this->belongsTo(MeetingSeries::class);
    }

    /**
     * Get the user who created this meeting
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all tasks associated with this meeting
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get all tags associated with this meeting
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Get all initiatives linked to this meeting
     */
    public function initiatives(): BelongsToMany
    {
        return $this->belongsToMany(Initiative::class, 'meeting_initiative');
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
     * Get tasks from the previous meeting in the series
     */
    public function tasksFromPreviousMeeting()
    {
        $previousMeeting = $this->previousMeeting();
        return $previousMeeting ? $previousMeeting->tasks : collect();
    }

    /**
     * Get tasks completed since the previous meeting
     */
    public function tasksCompletedSincePreviousMeeting()
    {
        $previousMeeting = $this->previousMeeting();
        if (!$previousMeeting) {
            return collect();
        }

        return $this->meetingSeries->allTasks()
            ->where('status', 'completed')
            ->where('updated_at', '>=', $previousMeeting->meeting_time)
            ->where('updated_at', '<', $this->meeting_time)
            ->get();
    }

    /**
     * Get open tasks from all previous meetings in the series
     */
    public function openTasksFromSeries()
    {
        if (!$this->meeting_series_id) {
            return collect();
        }

        return $this->meetingSeries->allTasks()
            ->where('status', '!=', 'completed')
            ->where('meeting_id', '!=', $this->id)
            ->get();
    }
}

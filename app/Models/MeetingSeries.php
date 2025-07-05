<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingSeries extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'created_by',
    ];

    /**
     * Get the user who created this meeting series
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all meetings in this series
     */
    public function meetings(): HasMany
    {
        return $this->hasMany(Meeting::class);
    }

    /**
     * Get the last meeting in this series
     */
    public function lastMeeting()
    {
        return $this->meetings()->latest('meeting_time')->first();
    }

    /**
     * Get all tasks from meetings in this series
     */
    public function allTasks()
    {
        return Task::whereIn('meeting_id', $this->meetings()->pluck('id'));
    }

    /**
     * Get tasks completed since the last meeting
     */
    public function tasksCompletedSinceLastMeeting()
    {
        $lastMeeting = $this->lastMeeting();
        if (!$lastMeeting) {
            return collect();
        }

        return $this->allTasks()
            ->where('status', 'completed')
            ->where('updated_at', '>=', $lastMeeting->meeting_time)
            ->get();
    }

    /**
     * Get tasks still open from any past meetings in the series
     */
    public function openTasks()
    {
        return $this->allTasks()
            ->where('status', '!=', 'completed')
            ->get();
    }
}

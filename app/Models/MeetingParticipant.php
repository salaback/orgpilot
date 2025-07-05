<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MeetingParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'meeting_id',
        'participantable_type',
        'participantable_id',
        'external_participant_name',
    ];

    /**
     * Get the meeting this participant belongs to
     */
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    /**
     * Get the participant (User or other model)
     */
    public function participantable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the participant name (either from User or external name)
     */
    public function getParticipantNameAttribute(): string
    {
        if ($this->external_participant_name) {
            return $this->external_participant_name;
        }

        if ($this->participantable instanceof User) {
            return $this->participantable->first_name . ' ' . $this->participantable->last_name;
        }

        return 'Unknown Participant';
    }
}

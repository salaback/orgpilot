<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OneOnOneActionItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'one_on_one_meeting_id',
        'description',
        'owner_id',
        'due_date',
        'completed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'due_date' => 'date',
        'completed' => 'boolean',
    ];

    /**
     * Get the meeting that owns the action item.
     */
    public function meeting(): BelongsTo
    {
        return $this->belongsTo(OneOnOneMeeting::class, 'one_on_one_meeting_id');
    }

    /**
     * Get the owner of the action item.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Scope a query to only include incomplete action items.
     */
    public function scopeIncomplete($query)
    {
        return $query->where('completed', false);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Employee extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'employees';

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
     * Get the organization structure this employee belongs to.
     */
    public function orgStructure(): BelongsTo
    {
        return $this->belongsTo(OrgStructure::class);
    }

    /**
     * Get the manager of this employee.
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    /**
     * Get the direct reports (subordinates) of this employee.
     */
    public function directReports(): HasMany
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    /**
     * Get the goals associated with this employee.
     */
    public function goals()
    {
        return $this->hasMany(Goal::class, 'employee_id');
    }

    /**
     * Get the initiatives assigned to this employee.
     */
    public function initiatives()
    {
        return $this->belongsToMany(Initiative::class);
    }

    /**
     * Get the tasks assigned to this employee.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Get the one-on-one meetings associated with this employee.
     */
    public function oneOnOneMeetings()
    {
        return $this->hasMany(OneOnOneMeeting::class, 'direct_report_node_id');
    }

    /**
     * Get all tags for this model.
     */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }
}

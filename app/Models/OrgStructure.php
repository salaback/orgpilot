<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrgStructure extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_primary',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Get the user that owns this org structure.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the employees for this org structure.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /**
     * Get the root employees (employees without managers) for this org structure.
     */
    public function rootEmployees()
    {
        return $this->employees()->whereNull('manager_id');
    }

    /**
     * Get the initiatives for this org structure.
     */
    public function initiatives(): HasMany
    {
        return $this->hasMany(Initiative::class);
    }

    /**
     * Sets this org structure as the primary one and unsets any other primary structures.
     */
    public function setPrimary(): bool
    {
        // Unset primary flag for all other structures of this user
        if ($this->user) {
            OrgStructure::where('user_id', $this->user_id)
                ->where('id', '!=', $this->id)
                ->update(['is_primary' => false]);
        }

        // Set this one as primary
        $this->is_primary = true;
        return $this->save();
    }
}

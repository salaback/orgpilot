<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'workos_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'workos_id',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the customers associated with the user.
     */
    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class);
    }

    /**
     * Get the full name by combining first and last name.
     * Falls back to the name field if first_name/last_name are not available.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        if ($this->first_name || $this->last_name) {
            return trim($this->first_name . ' ' . $this->last_name);
        }

        return $this->name;
    }

    /**
     * Set the name attribute to automatically update
     * first_name and last_name when setting the name.
     *
     * @param string $value
     * @return void
     */
    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = $value;

        // Only try to parse the name if first/last name aren't already set
        if ((!$this->first_name && !$this->last_name) && $value) {
            $nameParts = explode(' ', $value, 2);
            $this->attributes['first_name'] = $nameParts[0] ?? null;
            $this->attributes['last_name'] = $nameParts[1] ?? null;
        }
    }
}

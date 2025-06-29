<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    /**
     * Customer types
     */
    const TYPE_INDIVIDUAL = 'individual';
    const TYPE_ORGANIZATION = 'organization';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'website',
        // Internationalized address fields
        'address_line1',
        'address_line2',
        'address_line3',
        'locality',
        'administrative_area',
        'postal_code',
        'country',
        'country_code',
        // Individual-specific fields
        'first_name',
        'last_name',
        // Organization-specific fields
        'company_registration',
        'vat_number',
        'industry',
        'employee_count',
        // Billing contact
        'billing_contact_name',
        'billing_contact_email',
        'billing_contact_phone',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'employee_count' => 'integer',
        'type' => 'string',
    ];

    /**
     * Get the users associated with the customer.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Get the licenses associated with the customer.
     */
    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    /**
     * Check if the customer is an individual.
     *
     * @return bool
     */
    public function isIndividual(): bool
    {
        return $this->type === self::TYPE_INDIVIDUAL;
    }

    /**
     * Check if the customer is an organization.
     *
     * @return bool
     */
    public function isOrganization(): bool
    {
        return $this->type === self::TYPE_ORGANIZATION;
    }

    /**
     * Get full name for individual customers (combines first and last name).
     *
     * @return string|null
     */
    public function getFullNameAttribute(): ?string
    {
        if ($this->isIndividual() && ($this->first_name || $this->last_name)) {
            return trim($this->first_name . ' ' . $this->last_name);
        }

        return null;
    }

    /**
     * Create a new individual customer for a user.
     * This automatically populates customer information from the user.
     * For individual customers, only one user can be attached.
     *
     * @param User $user The user to create a customer for
     * @param array $additionalData Additional customer data
     * @return Customer The created customer
     */
    public static function createIndividualFromUser(User $user, array $additionalData = []): Customer
    {
        $customer = new self([
            'type' => self::TYPE_INDIVIDUAL,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
        ] + $additionalData);

        $customer->save();

        // Associate this user with the customer
        $customer->users()->attach($user->id);

        return $customer;
    }

    /**
     * Add a user to this customer.
     * For individual customers, this will replace any existing user.
     *
     * @param User $user The user to attach
     * @return void
     */
    public function addUser(User $user): void
    {
        if ($this->isIndividual()) {
            // For individual customers, detach all existing users first
            $this->users()->detach();
        }

        // Attach the new user
        $this->users()->attach($user->id);
    }

    /**
     * Sync user information to this customer if it's an individual account.
     * This is useful when a user updates their profile information.
     *
     * @param User $user The user to sync from
     * @param bool $save Whether to immediately save the changes
     * @return bool Whether any changes were made
     */
    public function syncFromUser(User $user, bool $save = true): bool
    {
        // Only sync for individual customers
        if (!$this->isIndividual()) {
            return false;
        }

        // For individual accounts, verify this user is actually associated with this customer
        if (!$this->users()->where('user_id', $user->id)->exists()) {
            return false;
        }

        $changed = false;

        // Update name fields from user
        if ($user->first_name && $this->first_name !== $user->first_name) {
            $this->first_name = $user->first_name;
            $changed = true;
        }

        if ($user->last_name && $this->last_name !== $user->last_name) {
            $this->last_name = $user->last_name;
            $changed = true;
        }

        // Set the display name to match the user's name
        if ($user->name && $this->name !== $user->name) {
            $this->name = $user->name;
            $changed = true;
        }

        // Update email if not already set
        if ($user->email && $this->email !== $user->email) {
            $this->email = $user->email;
            $changed = true;
        }

        // Save if there were changes and save is requested
        if ($changed && $save) {
            return $this->save();
        }

        return $changed;
    }

    /**
     * Get formatted address with appropriate line breaks based on available address components.
     * This method handles international address formats by adapting to the provided fields.
     *
     * @return string
     */
    public function getFormattedAddress(): string
    {
        $addressParts = [];

        // Add address lines if they exist
        if (!empty($this->address_line1)) {
            $addressParts[] = $this->address_line1;
        }

        if (!empty($this->address_line2)) {
            $addressParts[] = $this->address_line2;
        }

        if (!empty($this->address_line3)) {
            $addressParts[] = $this->address_line3;
        }

        // Format city/state/postal code according to country conventions
        $secondLine = $this->getLocalityAdminAreaPostalLine();
        if (!empty($secondLine)) {
            $addressParts[] = $secondLine;
        }

        // Add country if available
        if (!empty($this->country)) {
            $addressParts[] = strtoupper($this->country);
        }

        return implode("\n", $addressParts);
    }

    /**
     * Get a single line combination of locality, administrative area, and postal code
     * formatted according to country conventions when possible.
     *
     * @return string
     */
    public function getLocalityAdminAreaPostalLine(): string
    {
        // If we don't have a locality or country code, just combine what we have
        if (empty($this->locality) || empty($this->country_code)) {
            return trim(implode(', ', array_filter([
                $this->locality ?? null,
                $this->administrative_area ?? null,
                $this->postal_code ?? null
            ])));
        }

        // Format according to country conventions
        switch (strtoupper($this->country_code)) {
            // USA: City, State ZIP
            case 'US':
                return trim(implode(', ', array_filter([
                    $this->locality,
                    $this->administrative_area
                ]))) . ($this->postal_code ? ' ' . $this->postal_code : '');

            // UK: City, POST CODE (postal code on the same line but after locality)
            case 'GB':
                return trim(implode(', ', array_filter([
                    $this->locality,
                    $this->administrative_area
                ]))) . ($this->postal_code ? ' ' . $this->postal_code : '');

            // Japan: POSTAL CODE City, Prefecture (postal code first)
            case 'JP':
                return ($this->postal_code ? $this->postal_code . ' ' : '') .
                       trim(implode(', ', array_filter([
                           $this->locality,
                           $this->administrative_area
                       ])));

            // China: Province, City, Postal Code
            case 'CN':
                return trim(implode(', ', array_filter([
                    $this->administrative_area,
                    $this->locality,
                    $this->postal_code
                ])));

            // Default international format: City, Admin Area, Postal Code
            default:
                return trim(implode(', ', array_filter([
                    $this->locality,
                    $this->administrative_area,
                    $this->postal_code
                ])));
        }
    }

    /**
     * Get primary contact information based on customer type.
     *
     * @return array
     */
    public function getPrimaryContactInfo(): array
    {
        if ($this->isOrganization() && $this->billing_contact_name) {
            return [
                'name' => $this->billing_contact_name,
                'email' => $this->billing_contact_email,
                'phone' => $this->billing_contact_phone,
            ];
        }

        return [
            'name' => $this->isIndividual() ? $this->getFullNameAttribute() : $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
        ];
    }
}

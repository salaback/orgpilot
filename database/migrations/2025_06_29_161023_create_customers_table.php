<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Individual's full name or organization name
            $table->enum('type', ['individual', 'organization'])->default('individual');

            // Contact info
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable(); // Primarily for organizations

            // Address info - Internationalized
            $table->string('address_line1')->nullable(); // Street address / house number
            $table->string('address_line2')->nullable(); // Apartment, suite, unit, etc.
            $table->string('address_line3')->nullable(); // Additional address info for complex international addresses
            $table->string('locality')->nullable(); // City/Town/Village/Locality
            $table->string('administrative_area')->nullable(); // State/Province/Region/Prefecture/County
            $table->string('postal_code')->nullable(); // ZIP/Postal/PIN code
            $table->string('country')->nullable(); // Country
            $table->string('country_code', 2)->nullable(); // ISO 3166-1 alpha-2 country code (for programmatic use)

            // Individual-specific fields
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();

            // Organization-specific fields
            $table->string('company_registration')->nullable(); // Business registration number
            $table->string('vat_number')->nullable(); // Tax/VAT number
            $table->string('industry')->nullable();
            $table->integer('employee_count')->nullable();

            // Billing contact (for organizations)
            $table->string('billing_contact_name')->nullable();
            $table->string('billing_contact_email')->nullable();
            $table->string('billing_contact_phone')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

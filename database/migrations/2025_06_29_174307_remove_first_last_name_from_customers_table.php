<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration removes first_name and last_name from customers table
     * since these will now be sourced from the associated user.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Remove the individual-specific name fields from customers table
            $table->dropColumn(['first_name', 'last_name']);
        });
    }

    /**
     * Reverse the migrations.
     * This migration adds back the first_name and last_name fields to customers table.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Add back the individual-specific name fields to customers table
            $table->string('first_name')->nullable()->after('website');
            $table->string('last_name')->nullable()->after('first_name');
        });
    }
};

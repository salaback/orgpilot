<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration replaces the name field with first_name and last_name fields.
     */
    public function up(): void
    {
        // First, split the existing name field into first_name and last_name
        User::whereNull('first_name')->orWhereNull('last_name')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $nameParts = explode(' ', $user->name, 2);
                $user->first_name = $nameParts[0] ?? '';
                $user->last_name = $nameParts[1] ?? '';
                $user->save();
            }
        });

        // Now make first_name and last_name required (not nullable)
        Schema::table('users', function (Blueprint $table) {
            // Add a unique constraint on the combination of first_name, last_name, and email
            // This replaces the function of the name field in uniquely identifying users
            $table->unique(['first_name', 'last_name', 'email'], 'users_name_email_unique');
        });

        // Finally, remove the redundant name column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     * This migration adds back the name field and populates it from first_name and last_name.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add the name column back
            $table->string('name')->after('id');

            // Drop the unique constraint we added
            $table->dropUnique('users_name_email_unique');
        });

        // Populate the name field from first_name and last_name
        User::chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->name = trim($user->first_name . ' ' . $user->last_name);
                $user->save();
            }
        });

        // Make first_name and last_name nullable again (as they were in the original migration)
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
        });
    }
};

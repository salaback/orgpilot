<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Employee;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Updates the employees table to add first_name and last_name fields.
     */
    public function up(): void
    {
        // First add the new columns
        Schema::table('employees', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
        });

        // Copy data from name to first_name and last_name
        Employee::all()->each(function ($employee) {
            $nameParts = explode(' ', $employee->name, 2);
            $employee->first_name = $nameParts[0] ?? '';
            $employee->last_name = $nameParts[1] ?? '';
            $employee->save();
        });

        // Then drop the original name column
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First add back the name column
        Schema::table('employees', function (Blueprint $table) {
            $table->string('name')->nullable()->after('org_structure_id');
        });

        // Copy data from first_name and last_name back to name
        Employee::all()->each(function ($employee) {
            $employee->name = trim($employee->first_name . ' ' . $employee->last_name);
            $employee->save();
        });

        // Then drop the first_name and last_name columns
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name']);
        });
    }
};

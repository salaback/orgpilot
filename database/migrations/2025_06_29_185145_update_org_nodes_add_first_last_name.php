<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\OrgNode;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First add the new columns
        Schema::table('org_nodes', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
        });

        // Copy data from name to first_name and last_name
        OrgNode::all()->each(function ($node) {
            $nameParts = explode(' ', $node->name, 2);
            $node->first_name = $nameParts[0] ?? '';
            $node->last_name = $nameParts[1] ?? '';
            $node->save();
        });

        // Then drop the original name column
        Schema::table('org_nodes', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First add back the name column
        Schema::table('org_nodes', function (Blueprint $table) {
            $table->string('name')->nullable()->after('org_structure_id');
        });

        // Copy data from first_name and last_name back to name
        OrgNode::all()->each(function ($node) {
            $node->name = trim($node->first_name . ' ' . $node->last_name);
            $node->save();
        });

        // Then drop the first_name and last_name columns
        Schema::table('org_nodes', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name']);
        });
    }
};

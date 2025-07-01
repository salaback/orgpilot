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
        Schema::table('goals', function (Blueprint $table) {
            // Add org_node_id column
            $table->foreignId('org_node_id')->nullable()->after('id');

            // If there's existing data, you might want to add custom SQL to migrate data
            // from an existing column to org_node_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            // Drop the new column
            $table->dropColumn('org_node_id');
        });
    }
};

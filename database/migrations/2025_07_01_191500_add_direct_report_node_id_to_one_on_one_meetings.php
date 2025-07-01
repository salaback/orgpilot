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
        Schema::table('one_on_one_meetings', function (Blueprint $table) {
            // Add direct_report_node_id column
            $table->foreignId('direct_report_node_id')->nullable()->after('manager_id');

            // If there's any existing data, you could transfer it from direct_report_id to direct_report_node_id here
            // But that would require custom SQL which isn't included in this migration

            // Optionally, you might want to drop the old column if it exists and is no longer needed
            // $table->dropColumn('direct_report_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('one_on_one_meetings', function (Blueprint $table) {
            // Drop the new column
            $table->dropColumn('direct_report_node_id');

            // If you dropped direct_report_id in the up method, add it back here
            // $table->foreignId('direct_report_id')->nullable()->after('manager_id');
        });
    }
};

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
        Schema::table('meetings', function (Blueprint $table) {
            // Add meeting type field
            $table->string('type')->default('regular')->after('id');

            // Add fields from OneOnOneMeeting that aren't in Meeting already
            // Note: We'll use meeting_time instead of scheduled_at
            // Note: We'll use duration_minutes instead of completed_at
            // Note: We're removing manager_id and direct_report_id as per request
            $table->string('status')->default('scheduled')->after('notes');
            $table->text('agenda')->nullable()->after('title');
            $table->text('summary')->nullable();
            $table->string('location')->nullable();

            // Add indexes for common queries
            $table->index('type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            // Remove added fields
            $table->dropColumn([
                'type',
                'status',
                'agenda',
                'summary',
                'location'
            ]);

            // Remove added indexes
            $table->dropIndex(['type']);
            $table->dropIndex(['status']);
        });
    }
};

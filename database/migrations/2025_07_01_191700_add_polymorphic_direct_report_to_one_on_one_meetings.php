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
            // Add polymorphic relationship columns for direct report
            $table->string('direct_report_type')->nullable()->after('manager_id');
            $table->unsignedBigInteger('direct_report_id')->nullable()->after('direct_report_type');

            // Create an index on the polymorphic columns
            $table->index(['direct_report_type', 'direct_report_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('one_on_one_meetings', function (Blueprint $table) {
            // Drop the index
            $table->dropIndex(['direct_report_type', 'direct_report_id']);

            // Drop the polymorphic columns
            $table->dropColumn(['direct_report_type', 'direct_report_id']);
        });
    }
};

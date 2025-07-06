<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Meeting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create the necessary pivot tables for meeting relationships
        Schema::create('meeting_goals', function ($table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->onDelete('cascade');
            $table->foreignId('goal_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['meeting_id', 'goal_id']);
        });

        Schema::create('meeting_initiatives', function ($table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->onDelete('cascade');
            $table->foreignId('initiative_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['meeting_id', 'initiative_id']);
        });

        // Note: Data migration removed as per request
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the created pivot tables
        Schema::dropIfExists('meeting_goals');
        Schema::dropIfExists('meeting_initiatives');
    }
};

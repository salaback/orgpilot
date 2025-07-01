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
        Schema::create('one_on_one_meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('direct_report_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('scheduled_at');
            $table->dateTime('completed_at')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled
            $table->text('agenda')->nullable();
            $table->text('private_notes')->nullable();
            $table->text('shared_notes')->nullable();
            $table->text('summary')->nullable();
            $table->string('location')->nullable(); // physical location or zoom link
            $table->timestamps();

            // Index for quick lookup of meetings between a manager and direct report
            $table->index(['manager_id', 'direct_report_id']);
        });

        Schema::create('one_on_one_action_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('one_on_one_meeting_id')->constrained()->onDelete('cascade');
            $table->string('description');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->date('due_date')->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });

        Schema::create('one_on_one_related_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('one_on_one_meeting_id')->constrained()->onDelete('cascade');
            $table->foreignId('goal_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('one_on_one_related_initiatives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('one_on_one_meeting_id')->constrained()->onDelete('cascade');
            $table->foreignId('initiative_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('one_on_one_related_initiatives');
        Schema::dropIfExists('one_on_one_related_goals');
        Schema::dropIfExists('one_on_one_action_items');
        Schema::dropIfExists('one_on_one_meetings');
    }
};

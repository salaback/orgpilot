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
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('node_id')->constrained('org_nodes')->onDelete('cascade');
            $table->string('title');
            $table->enum('goal_type', ['performance', 'development', 'project'])->default('performance');
            $table->string('metric')->nullable(); // e.g., completion %, score
            $table->enum('status', ['not-started', 'in-progress', 'completed', 'cancelled'])->default('not-started');
            $table->date('due_date')->nullable();
            $table->boolean('private')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};

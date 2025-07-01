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
        // Drop the existing assignables table if it exists
        Schema::dropIfExists('assignables');

        // Create a pivot table for OrgNode and Task relationship
        Schema::create('org_node_task', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('org_node_id');
            $table->unsignedBigInteger('task_id');
            $table->timestamps();

            $table->foreign('org_node_id')->references('id')->on('org_nodes')->onDelete('cascade');
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->unique(['org_node_id', 'task_id']);
        });

        // Create a pivot table for OrgNode and Initiative relationship
        Schema::create('initiative_org_node', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('org_node_id');
            $table->unsignedBigInteger('initiative_id');
            $table->timestamps();

            $table->foreign('org_node_id')->references('id')->on('org_nodes')->onDelete('cascade');
            $table->foreign('initiative_id')->references('id')->on('initiatives')->onDelete('cascade');
            $table->unique(['org_node_id', 'initiative_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('initiative_org_node');
        Schema::dropIfExists('org_node_task');
    }
};

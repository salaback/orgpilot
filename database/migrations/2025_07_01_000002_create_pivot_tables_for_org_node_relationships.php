<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates pivot tables for employee relationships with tasks and initiatives.
     */
    public function up(): void
    {
        // Drop the existing assignables table if it exists
        Schema::dropIfExists('assignables');

        // Create a pivot table for Employee and Task relationship
        Schema::create('employee_task', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('task_id');
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->unique(['employee_id', 'task_id']);
        });

        // Create a pivot table for Employee and Initiative relationship
        Schema::create('employee_initiative', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('initiative_id');
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
            $table->foreign('initiative_id')->references('id')->on('initiatives')->onDelete('cascade');
            $table->unique(['employee_id', 'initiative_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_initiative');
        Schema::dropIfExists('employee_task');
    }
};

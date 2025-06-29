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
        Schema::create('org_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_structure_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Person's name or placeholder (e.g., "Open Role")
            $table->string('title')->nullable(); // e.g., "Engineering Manager"
            $table->string('email')->nullable();
            $table->enum('status', ['active', 'open', 'former'])->default('active');
            $table->enum('node_type', ['person', 'placeholder'])->default('person');
            $table->foreignId('manager_id')->nullable()->references('id')->on('org_nodes')->onDelete('set null');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('tags')->nullable(); // For skills, domains, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('org_nodes');
    }
};

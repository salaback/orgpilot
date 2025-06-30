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
        Schema::create('initiative_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('initiative_id')->constrained()->onDelete('cascade');
            $table->foreignId('org_node_id')->constrained('org_nodes')->onDelete('cascade');
            $table->timestamps();

            // Ensure each org_node can only be assigned to an initiative once
            $table->unique(['initiative_id', 'org_node_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('initiative_assignees');
    }
};

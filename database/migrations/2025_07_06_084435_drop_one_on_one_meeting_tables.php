<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the pivot tables first (foreign key constraints)
        Schema::dropIfExists('one_on_one_related_goals');
        Schema::dropIfExists('one_on_one_related_initiatives');

        // Drop the action items table
        Schema::dropIfExists('one_on_one_action_items');

        // Finally drop the main table
        Schema::dropIfExists('one_on_one_meetings');
    }

    /**
     * Reverse the migrations.
     *
     * Note: We're not implementing reverse migration since we're
     * explicitly not concerned about backwards compatibility
     */
    public function down(): void
    {
        // No reverse migration as per requirements
    }
};

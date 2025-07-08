<?php

namespace Tests\Feature;

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiNoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_notes()
    {
        $user = User::factory()->create();
        Note::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/notes');
        $response->assertOk();
        $response->assertJsonStructure([
            '*' => ['id', 'title', 'content', 'notable_type', 'notable_id', 'created_at', 'updated_at']
        ]);
    }

    public function test_can_show_a_note()
    {
        $user = User::factory()->create();
        $note = Note::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/notes/' . $note->id);
        $response->assertOk();
        $response->assertJsonFragment(['id' => $note->id]);
    }

    public function test_can_create_a_note()
    {
        $user = User::factory()->create();
        $payload = [
            'title' => 'Test Note',
            'content' => 'This is a test note.',
            'notable_type' => 'App\\Models\\Task',
            'notable_id' => 1,
        ];

        $response = $this->actingAs($user)->postJson('/api/notes', $payload);
        $response->assertCreated();
        $response->assertJsonFragment(['title' => 'Test Note']);
    }

    public function test_validation_error_on_create_note()
    {
        $user = User::factory()->create();
        $payload = [
            'title' => 'Missing content',
            // 'content' is required
            'notable_type' => 'App\\Models\\Task',
            'notable_id' => 1,
        ];

        $response = $this->actingAs($user)->postJson('/api/notes', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['content']);
    }

    public function test_can_update_a_note()
    {
        $user = User::factory()->create();
        $note = Note::factory()->create(['content' => 'Old content']);
        $payload = [
            'title' => $note->title,
            'content' => 'Updated content',
        ];

        $response = $this->actingAs($user)->putJson('/api/notes/' . $note->id, $payload);
        $response->assertOk();
        $response->assertJsonFragment(['content' => 'Updated content']);
    }

    public function test_can_delete_a_note()
    {
        $user = User::factory()->create();
        $note = Note::factory()->create();

        $response = $this->actingAs($user)->deleteJson('/api/notes/' . $note->id);
        $response->assertOk();
        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }
} 
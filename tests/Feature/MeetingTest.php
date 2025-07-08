<?php

namespace Tests\Feature;

use App\Models\Meeting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MeetingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_meetings()
    {
        $user = User::factory()->create();
        Meeting::factory()->count(3)->create();

        $response = $this->actingAs($user)->get('/meetings');
        $response->assertOk();
        $response->assertSee('Meeting'); // Basic check for Inertia page content
    }

    public function test_can_show_a_meeting()
    {
        $user = User::factory()->create();
        $meeting = Meeting::factory()->create();

        $response = $this->actingAs($user)->get('/meetings/' . $meeting->id);
        $response->assertOk();
        $response->assertSee($meeting->title ?? $meeting->id);
    }

    public function test_can_create_a_meeting()
    {
        $user = User::factory()->create();
        $payload = [
            'title' => 'Test Meeting',
            'meeting_time' => now()->addDay()->toDateTimeString(),
            'duration_minutes' => 30,
            'type' => 'regular',
        ];

        $response = $this->actingAs($user)->post('/meetings', $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('meetings', ['title' => 'Test Meeting']);
    }

    public function test_validation_error_on_create_meeting()
    {
        $user = User::factory()->create();
        $payload = [
            // 'title' and 'meeting_time' are required
            'duration_minutes' => 30,
        ];

        $response = $this->actingAs($user)->post('/meetings', $payload);
        $response->assertSessionHasErrors(['title', 'meeting_time']);
    }

    public function test_can_update_a_meeting()
    {
        $user = User::factory()->create();
        $meeting = Meeting::factory()->create(['title' => 'Old Title']);
        $payload = [
            'title' => 'Updated Title',
            'meeting_time' => $meeting->meeting_time,
            'meeting_series_id' => null,
            'notes' => null,
        ];

        $response = $this->actingAs($user)->patch('/meetings/' . $meeting->id, $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('meetings', ['id' => $meeting->id, 'title' => 'Updated Title']);
    }

    public function test_can_delete_a_meeting()
    {
        $user = User::factory()->create();
        $meeting = Meeting::factory()->create();

        $response = $this->actingAs($user)->delete('/meetings/' . $meeting->id);
        $response->assertRedirect();
        $this->assertDatabaseMissing('meetings', ['id' => $meeting->id]);
    }
} 
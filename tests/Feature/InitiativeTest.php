<?php

namespace Tests\Feature;

use App\Models\Initiative;
use App\Models\OrgStructure;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InitiativeTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_initiatives()
    {
        $user = User::factory()->create();
        Initiative::factory()->count(3)->create();

        $response = $this->actingAs($user)->get('/initiatives');
        $response->assertOk();
        $response->assertSee('Initiative'); // Basic check for Inertia page content
    }

    public function test_can_show_an_initiative()
    {
        $user = User::factory()->create();
        $initiative = Initiative::factory()->create();

        $response = $this->actingAs($user)->get('/initiatives/' . $initiative->id);
        $response->assertOk();
        $response->assertSee($initiative->title);
    }

    public function test_can_create_an_initiative()
    {
        $user = User::factory()->create();
        $org = OrgStructure::factory()->create(['user_id' => $user->id]);
        $payload = [
            'org_structure_id' => $org->id,
            'title' => 'Test Initiative',
            'description' => 'This is a test initiative.',
            'status' => 'planned',
        ];

        $response = $this->actingAs($user)->post('/initiatives', $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('initiatives', ['title' => 'Test Initiative']);
    }

    public function test_validation_error_on_create_initiative()
    {
        $user = User::factory()->create();
        $payload = [
            // 'title' is required
            'status' => 'planned',
        ];

        $response = $this->actingAs($user)->post('/initiatives', $payload);
        $response->assertSessionHasErrors(['title', 'org_structure_id']);
    }

    public function test_can_update_an_initiative()
    {
        $user = User::factory()->create();
        $initiative = Initiative::factory()->create(['title' => 'Old Title']);
        $payload = [
            'title' => 'Updated Title',
        ];

        $response = $this->actingAs($user)->patch('/initiatives/' . $initiative->id, $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('initiatives', ['id' => $initiative->id, 'title' => 'Updated Title']);
    }

    public function test_can_delete_an_initiative()
    {
        $user = User::factory()->create();
        $initiative = Initiative::factory()->create();

        $response = $this->actingAs($user)->delete('/initiatives/' . $initiative->id);
        $response->assertRedirect();
        $this->assertDatabaseMissing('initiatives', ['id' => $initiative->id]);
    }
} 
<?php

namespace Tests\Feature;

use App\Models\Tag;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_tags()
    {
        $customer = Customer::factory()->create();
        $user = User::factory()->create(['customer_id' => $customer->id]);
        Tag::factory()->count(3)->create(['customer_id' => $customer->id]);

        $response = $this->actingAs($user)->get('/api/tags');
        $response->assertOk();
        $response->assertSee('name'); // Basic check for tag data
    }

    public function test_can_create_a_tag()
    {
        $customer = Customer::factory()->create();
        $user = User::factory()->create(['customer_id' => $customer->id]);
        $payload = [
            'name' => 'TestTag',
        ];

        $response = $this->actingAs($user)->post('/api/tags', $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('tags', ['name' => 'TestTag']);
    }

    public function test_validation_error_on_create_tag()
    {
        $customer = Customer::factory()->create();
        $user = User::factory()->create(['customer_id' => $customer->id]);
        $response = $this->actingAs($user)->post('/api/tags', []);
        $response->assertSessionHasErrors(['name']);
    }
} 
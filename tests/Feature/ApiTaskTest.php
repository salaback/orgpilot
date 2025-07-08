<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_tasks()
    {
        $user = User::factory()->create();
        Task::factory()->count(3)->create();

        $response = $this->actingAs($user)->get('/tasks');
        $response->assertOk();
        $response->assertSee('Task'); // Basic check for Inertia page content
    }

    public function test_can_show_a_task()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create();

        $response = $this->actingAs($user)->get('/tasks/' . $task->id);
        $response->assertOk();
        $response->assertSee($task->title);
    }

    public function test_can_create_a_task()
    {
        $user = User::factory()->create();
        $payload = [
            'title' => 'Test Task',
            'description' => 'This is a test task.',
            'priority' => 'medium',
            'status' => 'not_started',
            'percentage_complete' => 0,
            'created_by' => $user->id,
        ];

        $response = $this->actingAs($user)->post('/tasks', $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['title' => 'Test Task']);
    }

    public function test_validation_error_on_create_task()
    {
        $user = User::factory()->create();
        $payload = [
            // 'title' is required
            'priority' => 'medium',
            'status' => 'not_started',
            'percentage_complete' => 0,
            'created_by' => $user->id,
        ];

        $response = $this->actingAs($user)->post('/tasks', $payload);
        $response->assertSessionHasErrors(['title']);
    }

    public function test_can_update_a_task()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['title' => 'Old Title']);
        $payload = [
            'title' => 'Updated Title',
        ];

        $response = $this->actingAs($user)->patch('/tasks/' . $task->id, $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'title' => 'Updated Title']);
    }

    public function test_can_delete_a_task()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create();

        $response = $this->actingAs($user)->delete('/tasks/' . $task->id);
        $response->assertRedirect();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_can_bulk_update_tasks()
    {
        $user = User::factory()->create();
        $tasks = Task::factory()->count(2)->create();
        $ids = $tasks->pluck('id')->toArray();

        $response = $this->actingAs($user)->patch('/tasks/bulk-update', [
            'task_ids' => $ids,
            'status' => 'completed',
        ]);
        $response->assertRedirect();
        foreach ($ids as $id) {
            $this->assertDatabaseHas('tasks', ['id' => $id, 'status' => 'completed']);
        }
    }

    public function test_can_update_task_progress()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['percentage_complete' => 0]);
        $response = $this->actingAs($user)->patch('/tasks/' . $task->id . '/progress', [
            'percentage_complete' => 100,
        ]);
        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'percentage_complete' => 100]);
    }
} 
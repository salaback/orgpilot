<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'initiative_id' => null, // Can be set in test
            'assigned_to' => null, // Can be set in test
            'created_by' => User::factory(),
            'due_date' => $this->faker->date(),
            'percentage_complete' => $this->faker->numberBetween(0, 100),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'status' => $this->faker->randomElement(['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']),
        ];
    }
} 
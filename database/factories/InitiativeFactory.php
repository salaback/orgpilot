<?php

namespace Database\Factories;

use App\Models\Initiative;
use App\Models\OrgStructure;
use Illuminate\Database\Eloquent\Factories\Factory;

class InitiativeFactory extends Factory
{
    protected $model = Initiative::class;

    public function definition(): array
    {
        return [
            'org_structure_id' => OrgStructure::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['planned', 'in-progress', 'complete', 'on-hold', 'cancelled']),
            'order' => $this->faker->numberBetween(1, 100),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
        ];
    }
} 
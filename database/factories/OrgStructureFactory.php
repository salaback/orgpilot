<?php

namespace Database\Factories;

use App\Models\OrgStructure;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrgStructureFactory extends Factory
{
    protected $model = OrgStructure::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->company(),
        ];
    }
} 
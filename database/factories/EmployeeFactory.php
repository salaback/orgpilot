<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\OrgStructure;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        return [
            'org_structure_id' => OrgStructure::factory(),
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'status' => 'active',
            'node_type' => 'person',
            'manager_id' => null,
        ];
    }
} 
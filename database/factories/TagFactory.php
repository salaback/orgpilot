<?php

namespace Database\Factories;

use App\Models\Tag;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

class TagFactory extends Factory
{
    protected $model = Tag::class;

    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'name' => $this->faker->word(),
        ];
    }
} 
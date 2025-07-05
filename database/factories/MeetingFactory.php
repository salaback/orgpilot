<?php

namespace Database\Factories;

use App\Models\Meeting;
use App\Models\MeetingSeries;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Meeting>
 */
class MeetingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(4),
            'meeting_series_id' => $this->faker->boolean(70) ? MeetingSeries::factory() : null,
            'meeting_time' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'notes' => $this->faker->paragraphs(3, true),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the meeting should be standalone (not part of a series).
     */
    public function standalone(): static
    {
        return $this->state(fn (array $attributes) => [
            'meeting_series_id' => null,
        ]);
    }

    /**
     * Indicate that the meeting should be part of a specific series.
     */
    public function inSeries(MeetingSeries $series): static
    {
        return $this->state(fn (array $attributes) => [
            'meeting_series_id' => $series->id,
        ]);
    }

    /**
     * Indicate that the meeting should be in the past.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'meeting_time' => $this->faker->dateTimeBetween('-2 months', '-1 day'),
        ]);
    }

    /**
     * Indicate that the meeting should be in the future.
     */
    public function future(): static
    {
        return $this->state(fn (array $attributes) => [
            'meeting_time' => $this->faker->dateTimeBetween('+1 day', '+2 months'),
        ]);
    }

    /**
     * Indicate that the meeting should have a specific creator.
     */
    public function createdBy(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
    }
}

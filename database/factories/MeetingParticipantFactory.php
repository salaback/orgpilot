<?php

namespace Database\Factories;

use App\Models\Meeting;
use App\Models\MeetingParticipant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MeetingParticipant>
 */
class MeetingParticipantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'meeting_id' => Meeting::factory(),
            'participantable_type' => User::class,
            'participantable_id' => User::factory(),
            'external_participant_name' => null,
        ];
    }

    /**
     * Indicate that the participant should be an external participant.
     */
    public function external(): static
    {
        return $this->state(fn (array $attributes) => [
            'participantable_type' => null,
            'participantable_id' => null,
            'external_participant_name' => $this->faker->name,
        ]);
    }

    /**
     * Indicate that the participant should be for a specific meeting.
     */
    public function forMeeting(Meeting $meeting): static
    {
        return $this->state(fn (array $attributes) => [
            'meeting_id' => $meeting->id,
        ]);
    }

    /**
     * Indicate that the participant should be a specific user.
     */
    public function user(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'participantable_type' => User::class,
            'participantable_id' => $user->id,
            'external_participant_name' => null,
        ]);
    }
}

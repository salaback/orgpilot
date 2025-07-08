<?php

namespace Tests\Feature;

use App\Models\OrgStructure;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_organization_structures()
    {
        $user = User::factory()->create();
        $org = OrgStructure::factory()->create(['user_id' => $user->id, 'is_primary' => true]);
        $root = Employee::factory()->create([
            'org_structure_id' => $org->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'status' => 'active',
            'node_type' => 'person',
            'manager_id' => null, // Ensure this is a root node
        ]);

        $version = \Inertia\Inertia::getVersion() ?? config('inertia.version') ?? 'test-version';
        $response = $this->actingAs($user)->get('/organisation', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $version,
        ]);
        // Debug output
        fwrite(STDERR, "Response status: " . $response->getStatusCode() . "\n");
        fwrite(STDERR, "Response body: " . substr($response->getContent(), 0, 500) . "\n");
        $response->assertOk();
        $response->assertSee('Organization Structure');
    }

    public function test_can_show_employee_profile()
    {
        $user = User::factory()->create();
        $employee = Employee::factory()->create();

        $response = $this->actingAs($user)->get('/organisation/profile/' . $employee->id);
        $response->assertOk();
        $response->assertSee($employee->first_name);
    }

    public function test_can_create_direct_report()
    {
        $user = User::factory()->create();
        $org = OrgStructure::factory()->create(['user_id' => $user->id, 'is_primary' => true]);
        $manager = Employee::factory()->create([
            'org_structure_id' => $org->id,
            'first_name' => 'Manager',
            'last_name' => 'User',
        ]);
        $payload = [
            'first_name' => 'Direct',
            'last_name' => 'Report',
            'title' => 'Engineer',
            'manager_id' => $manager->id,
            'status' => 'active',
            'node_type' => 'person',
        ];

        $response = $this->actingAs($user)->post('/organisation/direct-report', $payload);
        $response->assertRedirect();
        $this->assertDatabaseHas('employees', ['first_name' => 'Direct', 'manager_id' => $manager->id]);
    }

    public function test_validation_error_on_create_direct_report()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->post('/organisation/direct-report', []);
        $response->assertSessionHasErrors(['first_name', 'last_name', 'title', 'manager_id']);
    }
} 
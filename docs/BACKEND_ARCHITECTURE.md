# OrgPilot Backend Architecture

This document outlines the backend architecture and patterns used in the OrgPilot application.

## Overview

OrgPilot is built on Laravel, a PHP framework known for its elegant syntax and powerful features. The backend architecture follows Laravel best practices with some application-specific patterns.

## Controllers

Controllers in OrgPilot handle HTTP requests and return responses. Since this is an Inertia.js application, controllers typically return Inertia responses for page requests and JSON responses for API endpoints.

### Inertia Controllers

When serving pages with Inertia, controllers should return Inertia responses:

```php
public function index()
{
    $data = OrgStructure::with('employees')->get();
    
    return Inertia::render('OrgStructures/Index', [
        'orgStructures' => $data
    ]);
}
```

### API Controllers

For API endpoints, controllers should return JSON responses:

```php
public function apiIndex()
{
    $data = OrgStructure::with('employees')->get();
    
    return response()->json([
        'data' => $data
    ]);
}
```

## Models

OrgPilot uses Eloquent models to interact with the database. Key models include:

### User Model

```php
// app/Models/User.php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    // Properties, relationships, and methods
}
```

### Core Business Models

- **Employee** - Represents employees in the organization
- **OrgStructure** - Represents organizational structures/hierarchies
- **Initiative** - Represents company initiatives or projects
- **Task** - Represents individual tasks
- **Meeting** - Represents meetings
- **MeetingSeries** - Represents recurring meetings
- **Note** - Represents notes attached to various entities

### Model Relationships

Models in OrgPilot are extensively connected through Eloquent relationships:

```php
// Example from OrgStructure model
public function employees()
{
    return $this->hasMany(Employee::class);
}

public function rootNode()
{
    return $this->hasOne(Employee::class)->whereNull('manager_id');
}

// Example from Employee model
public function manager()
{
    return $this->belongsTo(Employee::class, 'manager_id');
}

public function directReports()
{
    return $this->hasMany(Employee::class, 'manager_id');
}

public function tasks()
{
    return $this->hasMany(Task::class);
}
```

## Policies

Authorization in OrgPilot is handled through Laravel Policies:

- **EmployeePolicy** - Controls access to employee records
- **OneOnOneMeetingPolicy** - Controls access to one-on-one meetings
- **EmployeePolicy** - Controls access to employees in the organization

Example policy method:

```php
public function view(User $user, Employee $employee)
{
    // Determine if the user can view the employee
    return $user->can('view employees') || $user->id === $employee->user_id;
}
```

## Services

Complex business logic is often extracted into dedicated service classes to keep controllers and models clean.

```php
class OrgChartService
{
    public function buildHierarchy(OrgStructure $structure)
    {
        // Complex logic for building an org chart hierarchy
    }
}
```

## Middleware

Custom middleware can be found in `app/Http/Middleware/`. Key middleware includes:

- **HandleInertiaRequests** - Prepares data for Inertia.js requests
- **Authenticate** - Handles authentication
- **RedirectIfAuthenticated** - Redirects authenticated users

## Routes

Routes are defined in the following files:

- `routes/web.php` - Main web routes
- `routes/auth.php` - Authentication routes
- `routes/settings.php` - User settings routes
- `routes/console.php` - Console (Artisan) commands

## Database Structure

The database schema is defined in migration files located in `database/migrations/`.

Key tables include:
- `users` - User accounts
- `employees` - Employee records
- `org_structures` - Organization structures
- `org_nodes` - Nodes within organization structures
- `initiatives` - Company initiatives
- `tasks` - Tasks assigned to employees
- `meetings` - Meeting records
- `meeting_participants` - Meeting attendees
- `meeting_series` - Recurring meeting definitions
- `notes` - Notes attached to various entities

## Factories and Seeders

Test data can be generated using factories and seeders located in:

- `database/factories/` - Define how to create fake models
- `database/seeders/` - Populate the database with test data

## Best Practices

When working on the OrgPilot backend, follow these guidelines:

1. **Use Policies for Authorization** - Don't put authorization logic in controllers
2. **Keep Controllers Thin** - Move complex business logic to dedicated service classes
3. **Use Eloquent Relationships** - Leverage Eloquent's relationship features rather than writing manual joins
4. **Follow Laravel Conventions** - Adhere to Laravel's naming conventions and code organization
5. **Use Migrations for Schema Changes** - Always create a new migration for schema changes rather than modifying existing ones
6. **Validate Input** - Use Laravel's form request validation or validate in the controller

## Testing

Backend functionality should be tested using Laravel's testing features:

```php
public function test_create_employee()
{
    $user = User::factory()->create();
    $this->actingAs($user);
    
    $response = $this->post('/employees', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        // Other required fields
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('employees', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
}
```

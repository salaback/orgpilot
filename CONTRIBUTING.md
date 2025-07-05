# OrgPilot Contributing Guide

This document provides essential information for working with the OrgPilot project, whether you're a developer or an AI assistant.

## Project Overview

OrgPilot is a Laravel-based web application using Inertia.js with React for the frontend. It appears to be an organizational management tool with features for tracking initiatives, meetings, and employee information.

## Development Environment

### Local Development with Laravel Sail

This project uses [Laravel Sail](https://laravel.com/docs/sail), a light-weight command-line interface for interacting with Laravel's Docker development environment.

**Important:** When running commands locally, prefix them with `./vendor/bin/sail` instead of using PHP or Artisan directly:

```bash
# Instead of:
php artisan migrate

# Use:
./vendor/bin/sail artisan migrate
```

For common commands:
- Start the development environment: `./vendor/bin/sail up`
- Start in detached mode: `./vendor/bin/sail up -d`
- Stop the environment: `./vendor/bin/sail down`
- Run tests: `./vendor/bin/sail test`

### Frontend Development

Frontend assets are managed with Vite. Use these commands via Sail:

```bash
# Run development server
./vendor/bin/sail npm run dev

# Build for production
./vendor/bin/sail npm run build
```

## Tech Stack

### Backend
- **Framework**: Laravel 12
- **PHP Version**: 8.2+
- **Database**: PostgreSQL
- **Authentication**: Laravel's built-in authentication system
- **Payment Processing**: Laravel Cashier (Stripe integration)
- **Third-Party Services**: WorkOS

### Frontend
- **Framework**: React with TypeScript
- **UI Framework**: Appears to use TailwindCSS
- **Routing/SPA**: Inertia.js
- **State Management**: React's built-in state management
- **Drag and Drop**: @dnd-kit library
- **Dialog Components**: Headless UI

## Project Structure

### Key Directories
- `/app` - Core Laravel application code
- `/resources/js` - React components and pages
- `/resources/js/pages` - Page components used by Inertia
- `/resources/js/layouts` - Layout components including AppLayout
- `/database/migrations` - Database migration files
- `/routes` - API and web routes

## Frontend Architecture

### Page Structure
All page components should be wrapped in the `AppLayout` component:

```tsx
import AppLayout from '@/layouts/app-layout';

const YourPage = () => {
  return (
    <AppLayout>
      {/* Your page content */}
    </AppLayout>
  );
};
```

The `AppLayout` component provides the consistent UI shell for the application, including navigation and common UI elements.

## Backend Architecture

### Controllers
Controllers should return Inertia responses rather than JSON when serving page requests:

```php
// Good - Returns Inertia response for page rendering
return Inertia::render('PageName', [
    'data' => $data
]);

// Avoid for page requests - Only use for API endpoints
return response()->json($data);
```

### Models
Models are located in `app/Models/` and include entities like:
- User
- Customer
- Employee
- Initiative
- Meeting
- Note
- Task
- OrgStructure

## Testing

The project uses PHPUnit for PHP tests. Run tests with:

```bash
./vendor/bin/sail test
```

## Code Style and Quality

- PHP code should follow PSR standards and can be formatted with Laravel Pint
- JavaScript/TypeScript code should follow the project's ESLint and Prettier configuration
- Run `./vendor/bin/sail npm run format` to format frontend code
- Run `./vendor/bin/sail npm run lint` to lint frontend code

## Workflow Guidelines

1. When creating new features, follow the existing patterns for controllers, models, and React components
2. Always wrap page components in the `AppLayout` component
3. Use TypeScript interfaces for props and state definitions
4. Follow the existing file naming conventions
5. For database changes, create proper migrations rather than modifying existing ones

## Common Patterns

### Inertia Page Props Interface
Define TypeScript interfaces for Inertia page props:

```tsx
interface YourPageProps extends PageProps {
  items: Item[];
  // other props...
}

const YourPage: React.FC<YourPageProps> = ({ items }) => {
  // component implementation
};
```

### Form Submission
Use Inertia's form helpers for form submission:

```tsx
import { useForm } from '@inertiajs/react';

// In your component:
const form = useForm({
  // form fields
});

const submit = () => {
  form.post(route('your.route'));
};
```

## Additional Notes

- The project appears to have organization-related features including initiatives, meetings, and employee management
- The application uses React's component model extensively
- Consider TypeScript type safety when making changes to ensure consistency

By following these guidelines, developers and AI assistants can maintain consistency and quality when working on the OrgPilot project.

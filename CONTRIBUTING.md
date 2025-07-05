# OrgPilot Contributing Guide

This document provides essential information for working with the OrgPilot project, whether you're a developer or an AI assistant.

## Project Overview

OrgPilot is a Laravel-based web application using Inertia.js with React for the frontend. It appears to be an organizational management tool with features for tracking initiatives, meetings, and employee information.

## Documentation Structure

To make it easier to find specific information, the documentation is split across several files:

- **[SETUP.md](./docs/SETUP.md)** - Setting up the development environment
- **[COMPONENTS.md](./COMPONENTS.md)** - UI component library reference
- **[FRONTEND_PATTERNS.md](./docs/FRONTEND_PATTERNS.md)** - Common frontend patterns and practices
- **[BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md)** - Backend architecture and patterns
- This file (CONTRIBUTING.md) - General guidelines and project structure

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
- `/docs` - Additional documentation files

## Frontend Architecture

### Component Library

OrgPilot uses a standardized component library to maintain consistency across the application. For detailed documentation on all available components, please refer to the [COMPONENTS.md](./COMPONENTS.md) file. When working on frontend features, you should use these existing components rather than creating new ones or implementing custom styles.

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

For detailed documentation on frontend patterns, including view headers, toggle components, action buttons, and form submission, see [FRONTEND_PATTERNS.md](./docs/FRONTEND_PATTERNS.md).

## Additional Notes

- The project appears to have organization-related features including initiatives, meetings, and employee management
- The application uses React's component model extensively
- Consider TypeScript type safety when making changes to ensure consistency

By following these guidelines, developers and AI assistants can maintain consistency and quality when working on the OrgPilot project.

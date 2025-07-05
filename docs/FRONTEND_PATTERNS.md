# Frontend Patterns

This document outlines common frontend patterns and components used throughout the OrgPilot application.

## View Headers and Toggle Components

The application follows a consistent pattern for views with toggleable display modes:
- **Toggle components** in the app sidebar header (OrgViewToggle, TaskViewToggle, InitiativeViewToggle)
- **View header components** on individual pages when more functionality is needed (OrgViewHeader, TaskViewHeader, InitiativeViewHeader)

### ViewHeader Component

Use the generic ViewHeader component for consistent headers across the application with view toggle functionality:

```tsx
import { ViewHeader } from '@/components/view-header';

// Inside your component:
return (
  <ViewHeader
    title="Your Page Title"
    description="Optional description or React node"
    cookieKey="unique-cookie-identifier" // Used to persist view preference
    defaultViewMode="list" // Can be 'list', 'split', or boolean
    onViewModeChange={handleViewModeChange}
    actions={<YourCustomActionButtons />}
    showToggleLabels={true} // Whether to show text labels on toggle buttons
  />
);
```

### OrgViewHeader Component

Use for organization view pages with navigation capabilities:

```tsx
import { OrgViewHeader } from '@/components/org-view-header';

// Inside your component:
return (
  <OrgViewHeader
    orgStructure={orgStructure}
    focusedNode={focusedNode}
    rootNode={rootNode}
    nodeHierarchy={nodeHierarchy}
    onNavigateUp={handleNavigateUp}
    onNavigateToRoot={handleNavigateToRoot}
    isListView={isListView}
    setIsListView={setIsListView}
  />
);
```

### TaskViewHeader Component

Use for task-related pages with task management actions:

```tsx
import { TaskViewHeader } from '@/components/task-view-header';

// Inside your component:
return (
  <TaskViewHeader
    title="Tasks"
    description="Optional description"
    viewMode={viewMode} // 'list' or 'split'
    onViewModeChange={handleViewModeChange}
    onAddTask={handleAddTask}
    filterActive={filterActive}
    onToggleFilter={handleToggleFilter}
  />
);
```

### InitiativeViewHeader Component

Use for initiative pages with initiative management actions:

```tsx
import { InitiativeViewHeader } from '@/components/initiative-view-header';

// Inside your component:
return (
  <InitiativeViewHeader
    title="Initiatives"
    description="Optional description"
    viewMode={viewMode} // 'list' or 'columns'
    onViewModeChange={handleViewModeChange}
    onAddInitiative={handleAddInitiative}
    filterActive={filterActive}
    onToggleFilter={handleToggleFilter}
    sortActive={sortActive}
    onToggleSort={handleToggleSort}
  />
);
```

### Toggle Components

For view toggles in the app sidebar header, use the appropriate toggle component:

#### OrgViewToggle Component
```tsx
import OrgViewToggle from '@/components/org-view-toggle';

return (
  <OrgViewToggle
    viewMode={orgViewMode} // 'grid' or 'list'
    onViewModeChange={handleOrgViewModeChange}
  />
);
```

#### TaskViewToggle Component
```tsx
import TaskViewToggle from '@/components/task-view-toggle';

return (
  <TaskViewToggle
    viewMode={taskViewMode} // 'list' or 'split'
    onViewModeChange={handleTaskViewModeChange}
  />
);
```

#### InitiativeViewToggle Component
```tsx
import InitiativeViewToggle from '@/components/initiative-view-toggle';

return (
  <InitiativeViewToggle
    viewMode={initiativeViewMode} // 'list' or 'columns'
    onViewModeChange={handleInitiativeViewModeChange}
  />
);
```

These components automatically persist user view preferences in cookies for a better user experience. View toggle components dispatch custom events that page components can listen for to maintain synchronization between different parts of the application.

**Important:** To avoid duplicate toggles, use only one toggle approach per page:
1. For pages that need only view mode toggling, use the app sidebar toggle components
2. For pages that need additional header functionality, use the corresponding view header component

## Action Buttons

Use the ActionButton component for all primary action buttons (like "New Initiative", "New Task", etc.) to maintain consistent styling across the application:

```tsx
import ActionButton from '@/components/ui/action-button';
import { PlusIcon } from 'lucide-react';

// Inside your component:
return (
  <ActionButton
    label="New Task"
    icon={PlusIcon}
    onClick={handleNewTask}
  />
);
```

The ActionButton component supports these properties:
- `label`: The text to display on the button (e.g., "New Task")
- `icon`: Optional Lucide icon component to display before the label
- `onClick`: Function to call when the button is clicked
- `variant`: "action" (black background), "outline", or "secondary" (default: "action")
- `size`: "sm", "default", "lg", or "icon" (default: "sm")
- `disabled`: Whether the button is disabled
- `className`: Additional CSS classes to apply

## Form Patterns

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

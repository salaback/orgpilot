# OrgPilot Component Library Documentation

This document provides an overview of all reusable UI components available in the OrgPilot application. When working on frontend features, please use these components to maintain consistency across the application.

## Table of Contents

- [UI Components](#ui-components)
  - [Action Button](#action-button)
  - [View Headers](#view-headers)
  - [View Toggles](#view-toggles)
- [Layout Components](#layout-components)
  - [App Layout](#app-layout)
- [Form Components](#form-components)
- [Utility Components](#utility-components)

## UI Components

### Action Button

Use the `ActionButton` component for primary actions like creating new items. It provides a standardized appearance for action buttons across the application.

#### Import
```tsx
import ActionButton from '@/components/ui/action-button';
import { PlusIcon } from 'lucide-react';
```

#### Usage
```tsx
<ActionButton
  label="New Task"
  icon={PlusIcon}
  onClick={handleNewTask}
/>
```

#### Props
- `label`: The text to display on the button (e.g., "New Task")
- `icon`: Optional Lucide icon component to display before the label
- `onClick`: Function to call when the button is clicked
- `variant`: "action" (black background), "outline", or "secondary" (default: "action")
- `size`: "sm", "default", "lg", or "icon" (default: "sm")
- `disabled`: Whether the button is disabled
- `className`: Additional CSS classes to apply

### View Headers

View header components provide consistent header sections for different views in the application. Each specialized header extends from the base `ViewHeader` component.

#### Base ViewHeader Component

The generic base component for all view headers.

##### Import
```tsx
import { ViewHeader } from '@/components/view-header';
```

##### Usage
```tsx
<ViewHeader
  title="Your Page Title"
  description="Optional description or React node"
  cookieKey="unique-cookie-identifier"
  defaultViewMode="list"
  onViewModeChange={handleViewModeChange}
  actions={<YourCustomActionButtons />}
  showToggleLabels={true}
/>
```

##### Props
- `title`: The main title displayed in the header
- `description`: Optional description text or React node
- `cookieKey`: Unique identifier for persisting view preferences
- `defaultViewMode`: Initial view mode ("list", "split", or boolean)
- `onViewModeChange`: Handler for view mode changes
- `actions`: Optional React node for action buttons
- `showToggleLabels`: Whether to show text labels on toggle buttons (default: true)

#### OrgViewHeader Component

Specialized header for organization views.

##### Import
```tsx
import { OrgViewHeader } from '@/components/org-view-header';
```

##### Usage
```tsx
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
```

#### TaskViewHeader Component

Specialized header for task views.

##### Import
```tsx
import { TaskViewHeader } from '@/components/task-view-header';
```

##### Usage
```tsx
<TaskViewHeader
  title="Tasks"
  description="Optional description"
  viewMode={viewMode}
  onViewModeChange={handleViewModeChange}
  onAddTask={handleAddTask}
  filterActive={filterActive}
  onToggleFilter={handleToggleFilter}
/>
```

#### InitiativeViewHeader Component

Specialized header for initiative views.

##### Import
```tsx
import { InitiativeViewHeader } from '@/components/initiative-view-header';
```

##### Usage
```tsx
<InitiativeViewHeader
  title="Initiatives"
  description="Optional description"
  viewMode={viewMode}
  onViewModeChange={handleViewModeChange}
  onAddInitiative={handleAddInitiative}
  filterActive={filterActive}
  onToggleFilter={handleToggleFilter}
  sortActive={sortActive}
  onToggleSort={handleToggleSort}
/>
```

### View Toggles

These toggle components are used specifically in the app sidebar header to switch between different view modes.

#### OrgViewToggle Component

##### Import
```tsx
import OrgViewToggle from '@/components/org-view-toggle';
```

##### Usage
```tsx
<OrgViewToggle
  viewMode={orgViewMode} // 'grid' or 'list'
  onViewModeChange={handleOrgViewModeChange}
/>
```

#### TaskViewToggle Component

##### Import
```tsx
import TaskViewToggle from '@/components/task-view-toggle';
```

##### Usage
```tsx
<TaskViewToggle
  viewMode={taskViewMode} // 'list' or 'split'
  onViewModeChange={handleTaskViewModeChange}
/>
```

#### InitiativeViewToggle Component

##### Import
```tsx
import InitiativeViewToggle from '@/components/initiative-view-toggle';
```

##### Usage
```tsx
<InitiativeViewToggle
  viewMode={initiativeViewMode} // 'list' or 'columns'
  onViewModeChange={handleInitiativeViewModeChange}
/>
```

## Layout Components

### App Layout

The main application layout component that provides the consistent UI shell for the application.

#### Import
```tsx
import AppLayout from '@/layouts/app-layout';
```

#### Usage
```tsx
<AppLayout>
  {/* Your page content */}
</AppLayout>
```

## Form Components

(Detailed documentation of form components will be added here)

## Utility Components

(Detailed documentation of utility components will be added here)

---

This documentation is a work in progress and will be expanded as new components are added to the application.

import React from 'react';
import { PlusIcon, FilterIcon } from 'lucide-react';
import { Button } from './ui/button';
import { ViewHeader, ViewMode } from './view-header';

type TaskViewMode = 'list' | 'split';

interface TaskViewHeaderProps {
  title: string;
  description?: string;
  viewMode: TaskViewMode;
  onViewModeChange: (mode: TaskViewMode) => void;
  onAddTask?: () => void;
  filterActive?: boolean;
  onToggleFilter?: () => void;
}

export function TaskViewHeader({
  title,
  description,
  viewMode,
  onViewModeChange,
  onAddTask,
  filterActive,
  onToggleFilter
}: TaskViewHeaderProps) {
  // Create action buttons
  const actionButtons = (
    <>
      {/* Task actions */}
      {onAddTask && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTask}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      )}

      {onToggleFilter && (
        <Button
          variant={filterActive ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleFilter}
          className="flex items-center gap-1"
        >
          <FilterIcon className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      )}
    </>
  );

  return (
    <ViewHeader
      title={title}
      description={description}
      cookieKey={`task-view-${title.toLowerCase().replace(/\s+/g, '-')}`}
      defaultViewMode={viewMode}
      onViewModeChange={(mode) => onViewModeChange(mode as TaskViewMode)}
      actions={actionButtons}
    />
  );
}

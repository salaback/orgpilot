// filepath: /Users/seanalaback/PhpstormProjects/OrgPilot/resources/js/components/task-header.tsx
import React from 'react';
import { SplitIcon, LayoutListIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { usePathname } from '@/hooks/use-pathname';

type ViewMode = 'list' | 'split';

interface TaskHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ viewMode, onViewModeChange }) => {
  const pathname = usePathname();
  const isTasksRoute = pathname === '/tasks' || pathname.startsWith('/tasks/');

  // Only show the toggle on the tasks routes
  if (!isTasksRoute) {
    return null;
  }

  return (
    <div className="ml-auto flex items-center">
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
        className="border rounded-md"
      >
        <ToggleGroupItem
          value="list"
          aria-label="Toggle list view"
          title="List View"
          className="data-[state=on]:bg-gray-100 px-2 py-1"
        >
          <LayoutListIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="split"
          aria-label="Toggle split view"
          title="Split View"
          className="data-[state=on]:bg-gray-100 px-2 py-1"
        >
          <SplitIcon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TaskHeader;

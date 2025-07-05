// filepath: /Users/seanalaback/PhpstormProjects/OrgPilot/resources/js/components/task-view-toggle.tsx
import React, { useState, useEffect } from 'react';
import { SplitIcon, LayoutListIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import TaskManagement from './task-management-enhanced';
import TaskSplitView from './task-split-view';

interface Task {
  id: number;
  title: string;
  description?: string;
  initiative_id?: number;
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  percentage_complete: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  created_at: string;
  updated_at: string;
  initiative?: {
    id: number;
    title: string;
  };
  assigned_to_node?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_by_user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
  }>;
}

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Initiative {
  id: number;
  title: string;
}

interface TaskViewToggleProps {
  tasks: Task[];
  initiatives?: Initiative[];
  orgNodes?: OrgNode[];
  initiativeId?: number;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}

type ViewMode = 'list' | 'split';

const TaskViewToggle: React.FC<TaskViewToggleProps> = (props) => {
  // Initialize with user's preference from localStorage if available
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem('taskViewMode');
    return (savedMode === 'list' || savedMode === 'split') ? savedMode : 'list';
  });

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('taskViewMode', viewMode);
  }, [viewMode]);

  return (
    <div className="flex flex-col h-full">
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
          <ToggleGroupItem value="list" aria-label="Toggle list view" title="List View">
            <LayoutListIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="split" aria-label="Toggle split view" title="Split View">
            <SplitIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Render the appropriate view based on the viewMode */}
      {viewMode === 'list' ? (
        <TaskManagement {...props} />
      ) : (
        <TaskSplitView {...props} />
      )}
    </div>
  );
};

export default TaskViewToggle;

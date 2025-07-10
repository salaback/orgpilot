import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TaskSplitView from '@/components/task-split-view';
import TaskManagement from '@/components/task-management-enhanced';
import { type BreadcrumbItem } from '@/types';

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

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Initiative {
  id: number;
  title: string;
}

interface TasksPageProps {
  tasks: {
    data: Task[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  initiatives: Initiative[];
  employees: Employee[];
  filters: {
    status?: string;
    priority?: string;
    assigned_to?: string;
    initiative_id?: string;
    overdue?: boolean;
    search?: string;
  };
  sorting: {
    sort_by?: string;
    sort_order?: string;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Tasks',
    href: '/tasks',
  },
];

export default function TasksPage({
  tasks,
  initiatives,
  employees,
  filters,
  sorting
}: TasksPageProps) {
  // Get the current view mode from localStorage to match header toggle
  const [viewMode, setViewMode] = useState<'list' | 'split'>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('taskViewMode');
      return (savedMode === 'list' || savedMode === 'split') ? savedMode as 'list' | 'split' : 'list';
    }
    return 'list';
  });

  // Keep view mode in sync with localStorage changes (from header toggle)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentMode = localStorage.getItem('taskViewMode') as 'list' | 'split';
      if (currentMode && currentMode !== viewMode) {
        setViewMode(currentMode);
      }
    };

    // Check for changes periodically (localStorage doesn't have events within same window)
    const interval = setInterval(handleStorageChange, 300);

    return () => clearInterval(interval);
  }, [viewMode]);

  const taskProps = {
    tasks: tasks.data,
    initiatives,
    employees,
    onTaskCreated: (task: any) => {
      console.log('Task created:', task);
    },
    onTaskUpdated: (task: any) => {
      console.log('Task updated:', task);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Task Management" />

      <div className="w-full h-full">
        {viewMode === 'list' ? (
          <TaskManagement {...taskProps} />
        ) : (
          <TaskSplitView {...taskProps} />
        )}
      </div>
    </AppLayout>
  );
}

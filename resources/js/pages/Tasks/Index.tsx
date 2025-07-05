import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TaskManagement from '@/components/task-management-enhanced';

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

interface TasksPageProps {
  tasks: {
    data: Task[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  initiatives: Initiative[];
  employees: OrgNode[];
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

export default function TasksPage({
  tasks,
  initiatives,
  employees,
  filters,
  sorting
}: TasksPageProps) {
  return (
    <AppLayout>
      <Head title="Task Management" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskManagement
          tasks={tasks.data}
          initiatives={initiatives}
          orgNodes={employees}
          onTaskCreated={(task) => {
            // Task created successfully - could trigger a refresh or update local state
            console.log('Task created:', task);
          }}
          onTaskUpdated={(task) => {
            // Task updated successfully - could trigger a refresh or update local state
            console.log('Task updated:', task);
          }}
        />
      </div>
    </AppLayout>
  );
}

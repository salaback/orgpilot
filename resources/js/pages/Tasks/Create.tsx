import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TaskManagement from '@/components/task-management';
import { type BreadcrumbItem } from '@/types';

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

interface TaskCreateProps {
  initiatives: Initiative[];
  orgNodes: OrgNode[];
  initiative_id?: number;
  task?: any;
  isEditing?: boolean;
}

const TaskCreate: React.FC<TaskCreateProps> = ({
  initiatives,
  orgNodes,
  initiative_id,
  task,
  isEditing
}) => {
  // Define breadcrumbs for create/edit task page
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Tasks',
      href: '/tasks',
    },
    {
      title: isEditing ? 'Edit Task' : 'Create Task',
      href: isEditing ? undefined : '/tasks/create',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'Edit Task' : 'Create Task'} />

      <div style={{ padding: '20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 600,
              margin: '0 0 8px 0',
              color: '#222'
            }}>
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h1>
            <p style={{
              color: '#666',
              fontSize: 16,
              margin: 0
            }}>
              {isEditing
                ? 'Edit the details of your task'
                : 'Create a new task and assign it to team members'}
            </p>
          </div>

          <TaskManagement
            tasks={[]}
            initiatives={initiatives}
            orgNodes={orgNodes}
            initiativeId={initiative_id}
            showCreateForm={!isEditing}
            editTask={isEditing ? task : undefined}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default TaskCreate;

import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../layout';
import TaskManagement from '../components/task-management';

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

interface TasksIndexProps {
  tasks: {
    data: Task[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    initiative_id?: string;
    assigned_to?: string;
    status?: string;
    priority?: string;
    search?: string;
  };
  initiatives: Initiative[];
  orgNodes: OrgNode[];
}

const TasksIndex: React.FC<TasksIndexProps> = ({
  tasks,
  filters,
  initiatives,
  orgNodes
}) => {
  return (
    <Layout>
      <Head title="Tasks" />

      <div style={{ padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 600,
              margin: '0 0 8px 0',
              color: '#222'
            }}>
              Tasks
            </h1>
            <p style={{
              color: '#666',
              fontSize: 16,
              margin: 0
            }}>
              Manage and track all your tasks and deliverables
            </p>
          </div>

          <TaskManagement
            tasks={tasks.data}
            initiatives={initiatives}
            orgNodes={orgNodes}
            showCreateForm={false}
          />

          {/* Pagination */}
          {tasks.last_page > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
              marginTop: 24,
              padding: 20
            }}>
              {tasks.current_page > 1 && (
                <a
                  href={`/tasks?page=${tasks.current_page - 1}`}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  Previous
                </a>
              )}

              <span style={{
                fontSize: 14,
                color: '#666'
              }}>
                Page {tasks.current_page} of {tasks.last_page} ({tasks.total} total tasks)
              </span>

              {tasks.current_page < tasks.last_page && (
                <a
                  href={`/tasks?page=${tasks.current_page + 1}`}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TasksIndex;

import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '../layout';
import TaskDetail from '../components/task-detail';

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
  notes?: Array<{
    id: number;
    title?: string;
    content: string;
    created_at: string;
    updated_at: string;
    tags?: Array<{
      id: number;
      name: string;
    }>;
  }>;
}

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface TaskShowProps {
  task: Task;
  orgNodes: OrgNode[];
}

const TaskShow: React.FC<TaskShowProps> = ({
  task,
  orgNodes
}) => {
  return (
    <Layout>
      <Head title={`Task: ${task.title}`} />

      <TaskDetail
        task={task}
        orgNodes={orgNodes}
      />
    </Layout>
  );
};

export default TaskShow;

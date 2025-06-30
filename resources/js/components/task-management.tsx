import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import TaskFormSheet from './task-form';
import { PieChart } from 'lucide-react';

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

interface TaskManagementProps {
  tasks?: Task[];
  initiatives?: Initiative[];
  orgNodes?: OrgNode[];
  initiativeId?: number;
  showCreateForm?: boolean;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks = [],
  initiatives = [],
  orgNodes = [],
  initiativeId,
  showCreateForm = false,
  onTaskCreated,
  onTaskUpdated
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: ''
  });

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  useEffect(() => {
    if (showCreateForm) {
      setIsCreating(true);
    }
  }, [showCreateForm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#007bff';
      case 'on_hold': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#ffc107';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && true;
  };

  const handleTaskCreated = (task: Task) => {
    setTaskList(prev => [task, ...prev]);
    setIsCreating(false);
    if (onTaskCreated) {
      onTaskCreated(task);
    }
  };

  const handleUpdateProgress = (task: Task, percentage: number) => {
    Inertia.patch(`/tasks/${task.id}/progress`, {
      percentage_complete: percentage
    }, {
      preserveScroll: true,
      onSuccess: () => {
        // Update local state
        setTaskList(prev => prev.map(t =>
          t.id === task.id
            ? { ...t, percentage_complete: percentage }
            : t
        ));
      }
    });
  };

  const filteredTasks = taskList.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assigned_to && task.assigned_to?.toString() !== filters.assigned_to) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return task.title.toLowerCase().includes(searchLower) ||
             task.description?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 500,
          color: '#222',
          margin: 0
        }}>
          Tasks ({filteredTasks.length})
        </h3>

        <Button
          onClick={() => setIsCreating(true)}
          style={{
            background: '#228be6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 16,
        flexWrap: 'wrap'
      }}>
        <Input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ minWidth: 200 }}
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          style={{
            padding: '6px 12px',
            border: '1px solid #e9ecef',
            borderRadius: 6,
            fontSize: 14
          }}
        >
          <option value="">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          style={{
            padding: '6px 12px',
            border: '1px solid #e9ecef',
            borderRadius: 6,
            fontSize: 14
          }}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          value={filters.assigned_to}
          onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
          style={{
            padding: '6px 12px',
            border: '1px solid #e9ecef',
            borderRadius: 6,
            fontSize: 14
          }}
        >
          <option value="">All Assignees</option>
          {orgNodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.first_name} {node.last_name}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredTasks.length === 0 ? (
          <Card style={{
            padding: 16,
            textAlign: 'center',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            background: '#f8f9fa'
          }}>
            <p style={{
              color: '#666',
              fontSize: 13,
              margin: 0,
              fontStyle: 'italic'
            }}>
              {filters.search || filters.status || filters.priority || filters.assigned_to
                ? 'No tasks match your current filters.'
                : 'No tasks yet. Create your first task to get started.'
              }
            </p>
          </Card>
        ) : (
          <div style={{ border: '1px solid #e9ecef', borderRadius: 6, overflow: 'hidden' }}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: 13,
                  borderBottom: '1px solid #f1f3f5',
                  background: '#fff',
                  cursor: 'pointer',
                  ...(selectedTask?.id === task.id ? { background: '#f0f6ff' } : {})
                }}
                onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
              >
                <span style={{ flex: 2, fontWeight: 500, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.title}
                  {isOverdue(task.due_date || '') && (
                    <Badge style={{
                      marginLeft: 6,
                      background: '#dc3545',
                      color: '#fff',
                      fontSize: 10,
                      padding: '1px 6px',
                      borderRadius: 4
                    }}>
                      OVERDUE
                    </Badge>
                  )}
                </span>
                <span style={{ flex: 1, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {task.assigned_to_node ? `${task.assigned_to_node.first_name} ${task.assigned_to_node.last_name}` : 'Unassigned'}
                </span>
                <span style={{ flex: 1, color: '#555', whiteSpace: 'nowrap' }}>
                  {task.due_date ? formatDate(task.due_date) : ''}
                </span>
                <span style={{ flex: 0.7 }}>
                  <Badge style={{
                    background: getPriorityColor(task.priority),
                    color: '#fff',
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 4
                  }}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </span>
                <span style={{ flex: 0.9 }}>
                  <Badge style={{
                    background: getStatusColor(task.status),
                    color: '#fff',
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 4
                  }}>
                    {task.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Badge>
                </span>
                <span style={{ flex: 0.7, color: '#555', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                  <PieChart
                    style={{ width: 18, height: 18 }}
                    strokeWidth={2}
                    color="#228be6"
                    fill="none"
                  />
                  <span>{task.percentage_complete}%</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Form Sheet for Task Creation */}
      <TaskFormSheet
        open={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Task"
        size="lg"
        initiatives={initiatives}
        orgNodes={orgNodes}
        initiativeId={initiativeId}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
};

export default TaskManagement;

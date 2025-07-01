import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import TaskFormSheet from './task-form';
import { PieChart } from 'lucide-react';
import TaskDetail from './task-detail';

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
      {/* If a task is selected, show the details view */}
      {selectedTask ? (
        <div>
          <Button
            onClick={() => setSelectedTask(null)}
            style={{ marginBottom: 16 }}
          >
            ← Back to Task List
          </Button>
          <TaskDetail task={selectedTask} />
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0">
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
          <div className="flex flex-col gap-1">
            {filteredTasks.length === 0 ? (
              <Card className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400 text-sm italic m-0">
                  {filters.search || filters.status || filters.priority || filters.assigned_to
                    ? 'No tasks match your current filters.'
                    : 'No tasks yet. Create your first task to get started.'
                  }
                </p>
              </Card>
            ) : (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center px-4 py-2 text-[15px] cursor-pointer transition-colors
                      bg-white dark:bg-gray-900
                      hover:bg-blue-50 dark:hover:bg-blue-950
                      ${selectedTask && selectedTask.id === task.id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <span className="flex-2 font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {task.title}
                      {isOverdue(task.due_date || '') && (
                        <Badge className="ml-2 bg-red-600 dark:bg-red-500 text-white text-xs px-2 py-0.5 rounded">OVERDUE</Badge>
                      )}
                    </span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">
                      {task.assigned_to_node ? `${task.assigned_to_node.first_name} ${task.assigned_to_node.last_name}` : 'Unassigned'}
                    </span>
                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                      {task.due_date ? formatDate(task.due_date) : ''}
                    </span>
                    <span className="flex-[0.7]">
                      <Badge className={`text-xs px-2 py-0.5 rounded font-semibold ${getPriorityColor(task.priority) === '#dc3545' ? 'bg-red-600 dark:bg-red-500' : getPriorityColor(task.priority) === '#fd7e14' ? 'bg-orange-500 dark:bg-orange-400' : getPriorityColor(task.priority) === '#ffc107' ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-green-600 dark:bg-green-400'} text-white`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </span>
                    <span className="flex-[0.9]">
                      <Badge className={`text-xs px-2 py-0.5 rounded font-semibold ${getStatusColor(task.status) === '#28a745' ? 'bg-green-600 dark:bg-green-500' : getStatusColor(task.status) === '#007bff' ? 'bg-blue-600 dark:bg-blue-400' : getStatusColor(task.status) === '#ffc107' ? 'bg-yellow-500 dark:bg-yellow-400' : getStatusColor(task.status) === '#dc3545' ? 'bg-red-600 dark:bg-red-500' : 'bg-gray-500 dark:bg-gray-400'} text-white`}>
                        {task.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Badge>
                    </span>
                    <span className="flex-[0.7] text-gray-700 dark:text-gray-300 text-right flex items-center justify-end gap-1">
                      <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                      <span>{task.percentage_complete}%</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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

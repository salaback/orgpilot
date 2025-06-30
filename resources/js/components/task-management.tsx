import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import NotesSection from './notes-section';

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
  const [isCreating, setIsCreating] = useState(showCreateForm);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: ''
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    initiative_id: initiativeId || '',
    assigned_to: '',
    due_date: '',
    priority: 'medium' as const,
    status: 'not_started' as const,
    percentage_complete: 0,
    tags: [] as string[]
  });

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

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

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const taskData = {
      ...newTask,
      initiative_id: newTask.initiative_id || null,
      assigned_to: newTask.assigned_to || null,
      due_date: newTask.due_date || null,
    };

    Inertia.post('/tasks', taskData, {
      onSuccess: (page) => {
        setNewTask({
          title: '',
          description: '',
          initiative_id: initiativeId || '',
          assigned_to: '',
          due_date: '',
          priority: 'medium',
          status: 'not_started',
          percentage_complete: 0,
          tags: []
        });
        setIsCreating(false);
        if (onTaskCreated && page.props.task) {
          onTaskCreated(page.props.task);
        }
      },
      onError: (errors) => {
        console.error('Failed to create task:', errors);
      }
    });
  };

  const handleUpdateTask = (task: Task, updates: Partial<Task>) => {
    Inertia.patch(`/tasks/${task.id}`, updates, {
      onSuccess: () => {
        setEditingTask(null);
        if (onTaskUpdated) {
          onTaskUpdated({ ...task, ...updates });
        }
      },
      onError: (errors) => {
        console.error('Failed to update task:', errors);
      }
    });
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

        {!isCreating && (
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
        )}
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

      {/* Create Task Form */}
      {isCreating && (
        <Card style={{
          padding: 16,
          marginBottom: 16,
          border: '2px solid #228be6',
          borderRadius: 8
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 500 }}>Create New Task</h4>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <Label>Title *</Label>
              <Input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title..."
              />
            </div>

            <div>
              <Label>Assigned To</Label>
              <select
                value={newTask.assigned_to}
                onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">Unassigned</option>
                {orgNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.first_name} {node.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Initiative</Label>
              <select
                value={newTask.initiative_id}
                onChange={(e) => setNewTask({ ...newTask, initiative_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">No Initiative</option>
                {initiatives.map(initiative => (
                  <option key={initiative.id} value={initiative.id}>
                    {initiative.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Priority</Label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Label>Description</Label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Task description..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px 12px',
                border: '1px solid #e9ecef',
                borderRadius: 6,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button
              onClick={() => setIsCreating(false)}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
              style={{
                background: newTask.title.trim() ? '#228be6' : '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 14,
                cursor: newTask.title.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Create Task
            </Button>
          </div>
        </Card>
      )}

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredTasks.length === 0 ? (
          <Card style={{
            padding: 24,
            textAlign: 'center',
            border: '1px solid #e9ecef',
            borderRadius: 8,
            background: '#f8f9fa'
          }}>
            <p style={{
              color: '#666',
              fontSize: 14,
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
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              style={{
                padding: 16,
                border: selectedTask?.id === task.id ? '2px solid #228be6' : '1px solid #e9ecef',
                borderRadius: 8,
                background: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 500,
                  margin: 0,
                  color: '#222'
                }}>
                  {task.title}
                  {isOverdue(task.due_date || '') && (
                    <Badge style={{
                      marginLeft: 8,
                      background: '#dc3545',
                      color: '#fff',
                      fontSize: 10
                    }}>
                      OVERDUE
                    </Badge>
                  )}
                </h4>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge style={{
                    background: getPriorityColor(task.priority),
                    color: '#fff',
                    fontSize: 10
                  }}>
                    {task.priority.toUpperCase()}
                  </Badge>

                  <Badge style={{
                    background: getStatusColor(task.status),
                    color: '#fff',
                    fontSize: 10
                  }}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              {task.description && (
                <p style={{
                  color: '#666',
                  fontSize: 14,
                  margin: '0 0 12px 0',
                  lineHeight: 1.4
                }}>
                  {task.description}
                </p>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12
              }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666' }}>
                  {task.assigned_to_node && (
                    <span>
                      Assigned: {task.assigned_to_node.first_name} {task.assigned_to_node.last_name}
                    </span>
                  )}
                  {task.due_date && (
                    <span>
                      Due: {formatDate(task.due_date)}
                    </span>
                  )}
                  {task.initiative && (
                    <span>
                      Initiative: {task.initiative.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4
                }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Progress</span>
                  <span style={{ fontSize: 12, color: '#666' }}>{task.percentage_complete}%</span>
                </div>

                <div style={{
                  width: '100%',
                  height: 8,
                  background: '#e9ecef',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${task.percentage_complete}%`,
                    height: '100%',
                    background: task.percentage_complete === 100 ? '#28a745' : '#007bff',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Quick Progress Update */}
              {selectedTask?.id === task.id && (
                <div style={{
                  marginTop: 16,
                  padding: 16,
                  background: '#f8f9fa',
                  borderRadius: 6,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <Label style={{ fontSize: 12, color: '#666' }}>
                      Update Progress: {task.percentage_complete}%
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.percentage_complete}
                      onChange={(e) => handleUpdateProgress(task, parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        marginTop: 4
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      onClick={() => window.open(`/tasks/${task.id}`, '_blank')}
                      style={{
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </Button>

                    <Button
                      onClick={() => window.open(`/tasks/${task.id}/edit`, '_blank')}
                      style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 12px',
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        fontSize: 10
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskManagement;

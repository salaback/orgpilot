import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from './ui/button';
import { Card } from './ui/card';
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

interface TaskDetailProps {
  task: Task;
  orgNodes?: OrgNode[];
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  orgNodes = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    assigned_to: task.assigned_to || '',
    due_date: task.due_date || '',
    priority: task.priority,
    status: task.status,
    percentage_complete: task.percentage_complete
  });

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
    return new Date(dueDate) < new Date();
  };

  const handleSave = () => {
    Inertia.patch(`/tasks/${task.id}`, editData, {
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: (errors) => {
        console.error('Failed to update task:', errors);
      }
    });
  };

  const handleProgressChange = (percentage: number) => {
    Inertia.patch(`/tasks/${task.id}/progress`, {
      percentage_complete: percentage
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setEditData({ ...editData, percentage_complete: percentage });
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      Inertia.delete(`/tasks/${task.id}`, {
        onSuccess: () => {
          // Redirect to tasks index or back to initiative
          if (task.initiative_id) {
            window.location.href = `/initiatives/${task.initiative_id}`;
          } else {
            window.location.href = '/tasks';
          }
        }
      });
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            margin: '0 0 8px 0',
            color: '#222'
          }}>
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  border: '2px solid #007bff',
                  borderRadius: 6,
                  padding: '8px 12px',
                  width: '100%',
                  maxWidth: 600
                }}
              />
            ) : (
              task.title
            )}
            {isOverdue(task.due_date || '') && (
              <Badge style={{
                marginLeft: 12,
                background: '#dc3545',
                color: '#fff',
                fontSize: 12,
                padding: '4px 8px'
              }}>
                OVERDUE
              </Badge>
            )}
          </h1>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Badge style={{
              background: getPriorityColor(task.priority),
              color: '#fff',
              fontSize: 12
            }}>
              {task.priority.toUpperCase()} PRIORITY
            </Badge>

            <Badge style={{
              background: getStatusColor(task.status),
              color: '#fff',
              fontSize: 12
            }}>
              {task.status.replace('_', ' ').toUpperCase()}
            </Badge>

            {task.initiative && (
              <span style={{ fontSize: 14, color: '#666' }}>
                Initiative: <a href={`/initiatives/${task.initiative.id}`} style={{ color: '#007bff' }}>
                  {task.initiative.title}
                </a>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                style={{
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                style={{
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                style={{
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    title: task.title,
                    description: task.description || '',
                    assigned_to: task.assigned_to || '',
                    due_date: task.due_date || '',
                    priority: task.priority,
                    status: task.status,
                    percentage_complete: task.percentage_complete
                  });
                }}
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
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Main Content */}
        <div>
          {/* Description */}
          <Card style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 500 }}>Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Task description..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: '12px',
                  border: '2px solid #007bff',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            ) : (
              <p style={{
                color: task.description ? '#444' : '#999',
                fontSize: 14,
                lineHeight: 1.5,
                margin: 0,
                fontStyle: task.description ? 'normal' : 'italic'
              }}>
                {task.description || 'No description provided.'}
              </p>
            )}
          </Card>

          {/* Progress */}
          <Card style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 500 }}>Progress</h3>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}>
              <span style={{ fontSize: 14, color: '#666' }}>Completion</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#222' }}>
                {editData.percentage_complete}%
              </span>
            </div>

            <div style={{
              width: '100%',
              height: 12,
              background: '#e9ecef',
              borderRadius: 6,
              overflow: 'hidden',
              marginBottom: 12
            }}>
              <div style={{
                width: `${editData.percentage_complete}%`,
                height: '100%',
                background: editData.percentage_complete === 100 ? '#28a745' : '#007bff',
                transition: 'width 0.3s ease'
              }} />
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={editData.percentage_complete}
              onChange={(e) => {
                const percentage = parseInt(e.target.value);
                setEditData({ ...editData, percentage_complete: percentage });
                handleProgressChange(percentage);
              }}
              style={{ width: '100%' }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#666',
              marginTop: 4
            }}>
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </Card>

          {/* Notes Section */}
          <NotesSection
            notes={task.notes || []}
            entityType="task"
            entityId={task.id}
            orgNodes={orgNodes}
          />
        </div>

        {/* Sidebar */}
        <div>
          <Card style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 500 }}>Task Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Assigned To */}
              <div>
                <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                  Assigned To
                </label>
                {isEditing ? (
                  <select
                    value={editData.assigned_to}
                    onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #007bff',
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
                ) : (
                  <div style={{ fontSize: 14, color: '#222' }}>
                    {task.assigned_to_node ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_to_node.first_name + ' ' + task.assigned_to_node.last_name)}&background=007bff&color=fff`}
                          alt={`${task.assigned_to_node.first_name} ${task.assigned_to_node.last_name}`}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%'
                          }}
                        />
                        {task.assigned_to_node.first_name} {task.assigned_to_node.last_name}
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                  Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #007bff',
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 14, color: task.due_date ? '#222' : '#999' }}>
                    {task.due_date ? formatDate(task.due_date) : 'No due date'}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #007bff',
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <Badge style={{
                    background: getPriorityColor(task.priority),
                    color: '#fff',
                    fontSize: 12
                  }}>
                    {task.priority.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '2px solid #007bff',
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
                ) : (
                  <Badge style={{
                    background: getStatusColor(task.status),
                    color: '#fff',
                    fontSize: 12
                  }}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Created By */}
              <div>
                <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                  Created By
                </label>
                <div style={{ fontSize: 14, color: '#222' }}>
                  {task.created_by_user ? (
                    `${task.created_by_user.first_name} ${task.created_by_user.last_name}`
                  ) : (
                    'Unknown'
                  )}
                </div>
              </div>

              {/* Created At */}
              <div>
                <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                  Created
                </label>
                <div style={{ fontSize: 14, color: '#222' }}>
                  {formatDate(task.created_at)}
                </div>
              </div>

              {/* Updated At */}
              {task.updated_at !== task.created_at && (
                <div>
                  <label style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'block' }}>
                    Last Updated
                  </label>
                  <div style={{ fontSize: 14, color: '#222' }}>
                    {formatDate(task.updated_at)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Card style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 500 }}>Tags</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      fontSize: 11
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;

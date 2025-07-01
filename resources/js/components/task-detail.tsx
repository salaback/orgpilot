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

  const PRIORITY_CLASS = {
    urgent: "bg-red-600 dark:bg-red-500 text-white",
    high: "bg-orange-500 dark:bg-orange-400 text-white",
    medium: "bg-yellow-500 dark:bg-yellow-400 text-white",
    low: "bg-green-600 dark:bg-green-400 text-white"
  };
  const STATUS_CLASS = {
    completed: "bg-green-600 dark:bg-green-500 text-white",
    in_progress: "bg-blue-600 dark:bg-blue-400 text-white",
    on_hold: "bg-yellow-500 dark:bg-yellow-400 text-white",
    cancelled: "bg-red-600 dark:bg-red-500 text-white",
    not_started: "bg-gray-500 dark:bg-gray-400 text-white"
  };

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
    // Create a sanitized version of the data
    const sanitizedData = {
      ...editData,
      // Ensure assigned_to is just an ID or null
      assigned_to: editData.assigned_to && typeof editData.assigned_to === 'object'
        ? editData.assigned_to.id
        : (editData.assigned_to || null),
      redirect_back: true
    };

    // Store initiative ID locally (in case it's needed for redirect)
    const initiativeId = task.initiative_id;

    Inertia.patch(`/tasks/${task.id}`, sanitizedData, {
      onSuccess: () => {
        setIsEditing(false);

        // If task belongs to an initiative, manually redirect to initiative page
        if (initiativeId) {
          window.location.href = `/initiatives/${initiativeId}`;
        }
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
    <div className="max-w-5xl mx-auto p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-3">
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-3xl font-bold border-2 border-blue-600 dark:border-blue-400 rounded-md px-3 py-2 w-full max-w-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            ) : (
              task.title
            )}
            {isOverdue(task.due_date || '') && (
              <Badge className="ml-3 bg-red-600 dark:bg-red-500 text-white text-xs px-2 py-1 rounded">OVERDUE</Badge>
            )}
          </h1>
          <div className="flex gap-3 items-center flex-wrap">
            <Badge className={`text-xs px-2 py-1 rounded ${PRIORITY_CLASS[task.priority]}`}>{task.priority.toUpperCase()} PRIORITY</Badge>
            <Badge className={`text-xs px-2 py-1 rounded ${STATUS_CLASS[task.status]}`}>{task.status.replace('_', ' ').toUpperCase()}</Badge>
            {task.initiative && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Initiative: <a href={`/initiatives/${task.initiative.id}`} className="text-blue-600 dark:text-blue-400 underline">{task.initiative.title}</a>
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow border-none"
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow border-none"
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow border-none"
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
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow border-none"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Description */}
          <Card className="p-5 mb-5">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Task description..."
                className="w-full min-h-[120px] p-3 border-2 border-blue-600 dark:border-blue-400 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-y"
              />
            ) : (
              <p className={`text-gray-900 dark:text-gray-100 ${task.description ? 'font-normal' : 'font-italic text-gray-500'}`}>
                {task.description || 'No description provided.'}
              </p>
            )}
          </Card>

          {/* Progress */}
          <Card className="p-5 mb-5">
            <h3 className="text-lg font-semibold mb-3">Progress</h3>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Completion</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editData.percentage_complete}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all" style={{ width: `${editData.percentage_complete}%` }} />
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
              className="w-full"
            />

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          <Card className="p-5 mb-5">
            <h3 className="text-lg font-semibold mb-4">Task Details</h3>

            <div className="flex flex-col gap-4">
              {/* Assigned To */}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                  Assigned To
                </label>
                {isEditing ? (
                  <select
                    value={editData.assigned_to}
                    onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                    className="w-full p-2 border-2 border-blue-600 dark:border-blue-400 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                  >
                    <option value="">Unassigned</option>
                    {orgNodes.map(node => (
                      <option key={node.id} value={node.id}>
                        {node.first_name} {node.last_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-900 dark:text-gray-100">
                    {task.assigned_to_node ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_to_node.first_name + ' ' + task.assigned_to_node.last_name)}&background=007bff&color=fff`}
                          alt={`${task.assigned_to_node.first_name} ${task.assigned_to_node.last_name}`}
                          className="w-6 h-6 rounded-full"
                        />
                        {task.assigned_to_node.first_name} {task.assigned_to_node.last_name}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                  Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                    className="w-full p-2 border-2 border-blue-600 dark:border-blue-400 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                  />
                ) : (
                  <div className="text-gray-900 dark:text-gray-100">
                    {task.due_date ? formatDate(task.due_date) : 'No due date'}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as any })}
                    className="w-full p-2 border-2 border-blue-600 dark:border-blue-400 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <Badge className={`text-xs px-2 py-1 rounded ${PRIORITY_CLASS[task.priority]}`}>
                    {task.priority.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                  Status
                </label>
                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    className="w-full p-2 border-2 border-blue-600 dark:border-blue-400 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <Badge className={`text-xs px-2 py-1 rounded ${STATUS_CLASS[task.status]}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Created By */}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                  Created By
                </label>
                <div className="text-gray-900 dark:text-gray-100">
                  {task.created_by_user ? (
                    `${task.created_by_user.first_name} ${task.created_by_user.last_name}`
                  ) : (
                    'Unknown'
                  )}
                </div>
              </div>

              {/* Created At */}
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                  Created
                </label>
                <div className="text-gray-900 dark:text-gray-100">
                  {formatDate(task.created_at)}
                </div>
              </div>

              {/* Updated At */}
              {task.updated_at !== task.created_at && (
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">
                    Last Updated
                  </label>
                  <div className="text-gray-900 dark:text-gray-100">
                    {formatDate(task.updated_at)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Card className="p-5">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded"
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

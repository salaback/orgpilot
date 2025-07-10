import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import TaskFormSheet from './task-form';
import { Progress } from './ui/progress';
import {
  Calendar,
  User,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpDown,
  Search,
  FileText,
  Target,
  Eye,
  Trash2
} from 'lucide-react';
import TaskDetail from './task-detail';
import TaskAssignment from './task-assignment';
import AssigneeDropdown from './ui/AssigneeDropdown';
import Dropdown from './ui/Dropdown';
import { ConfirmationModal } from './ui/confirmation-modal';
import axios from 'axios';

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

interface TaskManagementProps {
  tasks?: Task[];
  initiatives?: Initiative[];
  employees?: Employee[];
  initiativeId?: number;
  showCreateForm?: boolean;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}

interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}
interface PageProps {
  auth: { user: AuthUser };
}

const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks = [],
  initiatives = [],
  employees = [],
  initiativeId,
  showCreateForm = false,
  onTaskCreated,
  onTaskUpdated
}) => {
  const { props } = usePage<PageProps>();
  const currentUser = props.auth?.user;

  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'due_date' | 'priority' | 'status' | 'percentage_complete'>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: '',
    overdue: false,
    initiative: ''
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  useEffect(() => {
    if (showCreateForm) {
      setIsCreating(true);
    }
  }, [showCreateForm]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    return dueDateObj < today;
  };

  const isDueToday = (dueDate: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    return dueDateObj.getTime() === today.getTime();
  };

  const isDueTomorrow = (dueDate: string) => {
    if (!dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Normalize to start of day
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    return dueDateObj.getTime() === tomorrow.getTime();
  };

  const handleTaskCreated = (task: Task) => {
    setTaskList(prev => [task, ...prev]);
    setIsCreating(false);
    if (onTaskCreated) {
      onTaskCreated(task);
    }
  };

  const handleTaskAssignment = (taskId: number, assigneeId: number) => {
    // Update the task in the local state
    setTaskList(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            assigned_to: assigneeId,
            assigned_to_node: employees.find(node => node.id === assigneeId)
          }
        : task
    ));

    // Trigger callback if provided
    if (onTaskUpdated) {
      const updatedTask = taskList.find(t => t.id === taskId);
      if (updatedTask) {
        onTaskUpdated({
          ...updatedTask,
          assigned_to: assigneeId,
          assigned_to_node: employees.find(node => node.id === assigneeId)
        });
      }
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedTasks = taskList
    .filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assigned_to && task.assigned_to?.toString() !== filters.assigned_to) return false;
      if (filters.initiative && task.initiative_id?.toString() !== filters.initiative) return false;
      if (filters.overdue && !isOverdue(task.due_date || '')) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return task.title.toLowerCase().includes(searchLower) ||
               task.description?.toLowerCase().includes(searchLower) ||
               task.assigned_to_node?.first_name.toLowerCase().includes(searchLower) ||
               task.assigned_to_node?.last_name.toLowerCase().includes(searchLower);
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortBy === 'due_date') {
        aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
        bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
      } else if (sortBy === 'priority') {
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
      } else if (sortBy === 'percentage_complete') {
        aValue = a.percentage_complete;
        bValue = b.percentage_complete;
      } else {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Task statistics
  const taskStats = {
    total: taskList.length,
    completed: taskList.filter(t => t.status === 'completed').length,
    inProgress: taskList.filter(t => t.status === 'in_progress').length,
    overdue: taskList.filter(t => isOverdue(t.due_date || '')).length,
    avgProgress: taskList.length > 0 ? Math.round(taskList.reduce((sum, t) => sum + t.percentage_complete, 0) / taskList.length) : 0
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedTasks.length === 0) return;
    try {
      await axios.patch('/tasks/bulk-update', { task_ids: selectedTasks, status });
      setTaskList(prev => prev.map(t =>
        selectedTasks.includes(t.id) ? { ...t, status: status as Task['status'] } : t
      ));
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error bulk updating status', error);
    }
  };

  const handleTaskSelect = (taskId: number, selected: boolean) => {
    if (selected) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTasks(filteredAndSortedTasks.map(t => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assigned_to: '',
      search: '',
      overdue: false,
      initiative: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);

  const handlePriorityChange = async (taskId: number, priority: Task['priority']) => {
    try {
      const response = await axios.patch(`/tasks/${taskId}`, { priority });
      setTaskList(prev => prev.map(t =>
        t.id === taskId ? { ...t, priority } : t
      ));
      if (onTaskUpdated) onTaskUpdated(response.data.task);
    } catch (error) {
      console.error('Error updating priority', error);
    }
  };

  const handleStatusChange = async (taskId: number, status: Task['status']) => {
    try {
      const response = await axios.patch(`/tasks/${taskId}`, { status });
      setTaskList(prev => prev.map(t =>
        t.id === taskId ? { ...t, status } : t
      ));
      if (onTaskUpdated) onTaskUpdated(response.data.task);
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleAssigneeChange = async (taskId: number, assigneeId: number | null) => {
    try {
      const response = await axios.patch(`/tasks/${taskId}`, { assigned_to: assigneeId });
      // Update local state
      setTaskList(prev => prev.map(t =>
        t.id === taskId ? { ...t, assigned_to: assigneeId, assigned_to_node: employees.find(n => n.id === assigneeId) || null } : t
      ));
      if (onTaskUpdated) {
        onTaskUpdated({
          ...response.data.task,
          assigned_to: assigneeId,
          assigned_to_node: employees.find(n => n.id === assigneeId) || null
        });
      }
    } catch (error) {
      console.error('Error updating assignee', error);
    }
  };

  const handleProgressChange = async (taskId: number, percentage: number) => {
    try {
      const response = await axios.patch(`/tasks/${taskId}`, { percentage_complete: percentage });
      setTaskList(prev => prev.map(t =>
        t.id === taskId ? { ...t, percentage_complete: percentage } : t
      ));
      if (onTaskUpdated) onTaskUpdated(response.data.task);
    } catch (error) {
      console.error('Error updating progress', error);
    }
  };

  const handleDueDateChange = async (taskId: number, dueDate: string | null) => {
    try {
      const response = await axios.patch(`/tasks/${taskId}`, { due_date: dueDate });
      setTaskList(prev => prev.map(t =>
        t.id === taskId ? { ...t, due_date: dueDate } : t
      ));
      if (onTaskUpdated) onTaskUpdated(response.data.task);
    } catch (error) {
      console.error('Error updating due date', error);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTaskForEdit(task);
    setEditForm({
      title: task.title,
      description: task.description || ''
    });
  };

  const handleSaveTaskEdit = async () => {
    if (!selectedTaskForEdit) return;

    try {
      const response = await axios.patch(`/tasks/${selectedTaskForEdit.id}`, {
        title: editForm.title,
        description: editForm.description
      });

      setTaskList(prev => prev.map(t =>
        t.id === selectedTaskForEdit.id
          ? { ...t, title: editForm.title, description: editForm.description }
          : t
      ));

      if (onTaskUpdated) onTaskUpdated(response.data.task);
      setSelectedTaskForEdit(null);
      setEditForm({ title: '', description: '' });
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      // Delete each selected task
      await Promise.all(selectedTasks.map(taskId =>
        axios.delete(`/tasks/${taskId}`)
      ));

      // Remove the deleted tasks from the list
      setTaskList(prev => prev.filter(task => !selectedTasks.includes(task.id)));

      // Clear the selection
      setSelectedTasks([]);

      // Close the confirmation modal
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error('Error deleting tasks', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Task Details Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Task Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
              <TaskDetail task={selectedTask} />
            </div>
          </div>
        )}

        {/* Task Edit Modal */}
        {selectedTaskForEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full m-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Task</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTaskForEdit(null);
                    setEditForm({ title: '', description: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title
                  </label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter task title..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTaskForEdit(null);
                    setEditForm({ title: '', description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTaskEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!editForm.title.trim()}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Deletion */}
        {isConfirmingDelete && (
          <ConfirmationModal
            isOpen={isConfirmingDelete}
            onClose={() => setIsConfirmingDelete(false)}
            onConfirm={handleBulkDelete}
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${selectedTasks.length} task(s)? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            danger={true}
          />
        )}

        {/* Header with Statistics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Task Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and track all tasks across your organization
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {taskStats.total}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {taskStats.completed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {taskStats.inProgress}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {taskStats.overdue}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {taskStats.avgProgress}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks, assignees, or descriptions..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
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
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.assigned_to}
                onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="">All Assignees</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>

              <select
                value={filters.initiative}
                onChange={(e) => setFilters({ ...filters, initiative: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                <option value="">All Initiatives</option>
                {initiatives.map(initiative => (
                  <option key={initiative.id} value={initiative.id}>
                    {initiative.title}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 px-3 py-2 text-sm">
                <Checkbox
                  checked={filters.overdue}
                  onCheckedChange={(checked) => setFilters({ ...filters, overdue: checked as boolean })}
                />
                Overdue Only
              </label>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTasks.length} task(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('completed')}
                >
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('in_progress')}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTasks([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Task List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 p-0 h-auto text-sm font-medium"
                    >
                      Task
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('due_date')}
                      className="flex items-center gap-1 p-0 h-auto text-sm font-medium"
                    >
                      Due Date
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Assignee
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('priority')}
                      className="flex items-center gap-1 p-0 h-auto text-sm font-medium"
                    >
                      Priority
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 p-0 h-auto text-sm font-medium"
                    >
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('percentage_complete')}
                      className="flex items-center gap-1 p-0 h-auto text-sm font-medium"
                    >
                      Progress
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      {hasActiveFilters ? (
                        <div className="space-y-2">
                          <p>No tasks match your current filters.</p>
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear Filters
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p>No tasks yet. Create your first task to get started.</p>
                          <Button onClick={() => setIsCreating(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Task
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => handleTaskSelect(task.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <button
                              className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                              onClick={() => setSelectedTaskForEdit(task)}
                            >
                              {task.title}
                            </button>
                            {task.initiative && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {task.initiative.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <Dropdown
                          trigger={
                            <button className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                              <Calendar className="w-3 h-3" />
                              <span className={isOverdue(task.due_date) ? "text-red-600 font-medium" : isDueToday(task.due_date) ? "text-yellow-600 font-medium" : isDueTomorrow(task.due_date) ? "text-blue-600 font-medium" : ""}>
                                {task.due_date ? formatDate(task.due_date) : 'No due date'}
                              </span>
                              {isOverdue(task.due_date) && (
                                <Badge className="ml-2 bg-red-100 text-red-800 text-xs px-1">Overdue</Badge>
                              )}
                              {isDueToday(task.due_date) && (
                                <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1">Today</Badge>
                              )}
                              {isDueTomorrow(task.due_date) && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs px-1">Tomorrow</Badge>
                              )}
                            </button>
                          }
                        >
                          <Card className="mt-2 w-64 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Due Date
                                </span>
                                {task.due_date && (
                                  <button
                                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                    onClick={() => handleDueDateChange(task.id, null)}
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <input
                                type="date"
                                value={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleDueDateChange(task.id, e.target.value || null)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Quick options:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { label: 'Today', days: 0 },
                                    { label: 'Tomorrow', days: 1 },
                                    { label: 'In 3 days', days: 3 },
                                    { label: 'Next week', days: 7 },
                                    { label: 'In 2 weeks', days: 14 },
                                    { label: 'Next month', days: 30 }
                                  ].map(option => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + option.days);
                                    const dateString = date.toISOString().split('T')[0];
                                    return (
                                      <button
                                        key={option.label}
                                        className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                                        onClick={() => handleDueDateChange(task.id, dateString)}
                                      >
                                        {option.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Dropdown>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <AssigneeDropdown
                          taskId={task.id}
                          currentAssigneeId={task.assigned_to ?? undefined}
                          employees={employees}
                          currentUser={currentUser}
                          onChange={handleAssigneeChange}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="p-0">
                              <Badge variant={
                                task.priority === 'urgent' ? 'destructive' :
                                task.priority === 'high' ? 'default' :
                                task.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </Badge>
                            </Button>
                          }
                        >
                          <Card className="mt-2 w-40 p-2">
                            <div className="space-y-1">
                              {['urgent','high','medium','low'].map(p => {
                                const priorityConfig = {
                                  urgent: { color: 'bg-red-500', icon: '🔴', label: 'Urgent' },
                                  high: { color: 'bg-orange-500', icon: '🟠', label: 'High' },
                                  medium: { color: 'bg-yellow-500', icon: '🟡', label: 'Medium' },
                                  low: { color: 'bg-green-500', icon: '🟢', label: 'Low' }
                                };
                                const config = priorityConfig[p as keyof typeof priorityConfig];
                                return (
                                  <button
                                    key={p}
                                    className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    onClick={() => handlePriorityChange(task.id, p as Task['priority'])}
                                  >
                                    <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                                      {config.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </Card>
                        </Dropdown>
                      </td>
                      <td className="px-4 py-3">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm" className="p-0">
                              <Badge variant={
                                task.status === 'completed' ? 'default' :
                                task.status === 'in_progress' ? 'secondary' :
                                task.status === 'on_hold' ? 'outline' :
                                task.status === 'cancelled' ? 'destructive' : 'outline'
                              }>
                                {task.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </Badge>
                            </Button>
                          }
                        >
                          <Card className="mt-2 w-48 p-2">
                            <div className="space-y-1">
                              {['not_started','in_progress','completed','on_hold','cancelled'].map(s => {
                                const statusConfig = {
                                  not_started: { icon: '⚪', label: 'Not Started', color: 'text-gray-600' },
                                  in_progress: { icon: '🔵', label: 'In Progress', color: 'text-blue-600' },
                                  completed: { icon: '✅', label: 'Completed', color: 'text-green-600' },
                                  on_hold: { icon: '⏸️', label: 'On Hold', color: 'text-yellow-600' },
                                  cancelled: { icon: '❌', label: 'Cancelled', color: 'text-red-600' }
                                };
                                const config = statusConfig[s as keyof typeof statusConfig];
                                return (
                                  <button
                                    key={s}
                                    className="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    onClick={() => handleStatusChange(task.id, s as Task['status'])}
                                  >
                                    <span className="text-base">{config.icon}</span>
                                    <span className={`font-medium ${config.color} dark:text-gray-100`}>
                                      {config.label}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </Card>
                        </Dropdown>
                      </td>
                      <td className="px-4 py-3">
                        <Dropdown
                          trigger={
                            <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                              <Progress value={task.percentage_complete} className="w-16" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {task.percentage_complete}%
                              </span>
                            </button>
                          }
                        >
                          <Card className="mt-2 w-64 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Progress
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {task.percentage_complete}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={task.percentage_complete}
                                onChange={(e) => handleProgressChange(task.id, parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                                style={{
                                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${task.percentage_complete}%, #e5e7eb ${task.percentage_complete}%, #e5e7eb 100%)`
                                }}
                              />
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                              </div>
                              <div className="flex gap-2">
                                {[0, 25, 50, 75, 100].map(percent => (
                                  <button
                                    key={percent}
                                    className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => handleProgressChange(task.id, percent)}
                                  >
                                    {percent}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </Card>
                        </Dropdown>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTask(task)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Task Form Sheet */}
        <TaskFormSheet
          open={isCreating}
          onClose={() => setIsCreating(false)}
          initiatives={initiatives}
          employees={employees}
          initiativeId={initiativeId}
          onSuccess={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default TaskManagement;

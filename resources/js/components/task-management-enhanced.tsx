import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
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
  MoreHorizontal,
  ArrowUpDown,
  Search,
  FileText,
  Target,
  Eye
} from 'lucide-react';
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
    return new Date(dueDate) < new Date();
  };

  const handleTaskCreated = (task: Task) => {
    setTaskList(prev => [task, ...prev]);
    setIsCreating(false);
    if (onTaskCreated) {
      onTaskCreated(task);
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
      let aValue: string | number = '';
      let bValue: string | number = '';

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

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedTasks.length === 0) return;

    Inertia.patch('/tasks/bulk-update', {
      task_ids: selectedTasks,
      status: status
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setTaskList(prev => prev.map(t =>
          selectedTasks.includes(t.id) ? { ...t, status: status as Task['status'] } : t
        ));
        setSelectedTasks([]);
      }
    });
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

  return (
    <div className="space-y-6">
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
              {orgNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.first_name} {node.last_name}
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
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {task.title}
                            {isOverdue(task.due_date || '') && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          {task.initiative && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {task.initiative.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {task.due_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.due_date)}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {task.assigned_to_node ? (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {task.assigned_to_node.first_name} {task.assigned_to_node.last_name}
                        </div>
                      ) : (
                        'Unassigned'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'default' :
                          task.priority === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' :
                          task.status === 'on_hold' ? 'outline' :
                          task.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                      >
                        {task.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={task.percentage_complete} className="w-16" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {task.percentage_complete}%
                        </span>
                      </div>
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

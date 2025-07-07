// filepath: /Users/seanalaback/PhpstormProjects/OrgPilot/resources/js/components/task-split-view.tsx
import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import NotesSection from './notes-section';
import TaskFormSheet from './task-form';
import TaskDetail from './task-detail';
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
  Tag,
  Eye,
  ArrowLeft
} from 'lucide-react';
import AssigneeDropdown from './ui/AssigneeDropdown';
import Dropdown from './ui/Dropdown';

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

interface Initiative {
  id: number;
  title: string;
}

interface TaskSplitViewProps {
  tasks: Task[];
  initiatives?: Initiative[];
  orgNodes?: OrgNode[];
  initiativeId?: number;
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

const TaskSplitView: React.FC<TaskSplitViewProps> = ({
  tasks = [],
  initiatives = [],
  orgNodes = [],
  initiativeId,
  onTaskCreated,
  onTaskUpdated
}) => {
  const { props } = usePage<PageProps>();
  const currentUser = props.auth?.user;

  // State for managing tasks and UI
  const [isCreating, setIsCreating] = useState(false);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: '',
    overdue: false,
    initiative: initiativeId ? String(initiativeId) : ''
  });
  const [sortBy, setSortBy] = useState<'title' | 'due_date' | 'priority' | 'status' | 'percentage_complete'>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Update task list when tasks prop changes
  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  // Set initial selected task if tasks are available
  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0]);
    }
  }, [tasks]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Check if task is overdue
  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    return dueDateObj < today;
  };

  // Check if task is due today
  const isDueToday = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    return dueDateObj.getTime() === today.getTime();
  };

  // Check if task is due tomorrow
  const isDueTomorrow = (dueDate?: string) => {
    if (!dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Normalize to start of day
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    return dueDateObj.getTime() === tomorrow.getTime();
  };

  // Handle task creation
  const handleTaskCreated = (task: Task) => {
    setTaskList(prev => [task, ...prev]);
    setSelectedTask(task);
    setIsCreating(false);
    if (onTaskCreated) {
      onTaskCreated(task);
    }
  };

  // Handle task assignment
  const handleTaskAssignment = (taskId: number, assigneeId: number | null) => {
    // Update the task in the local state
    setTaskList(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            assigned_to: assigneeId,
            assigned_to_node: assigneeId ? orgNodes?.find(node => node.id === assigneeId) : undefined
          }
        : task
    ));

    // Update selected task if it's the one being assigned
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({
        ...selectedTask,
        assigned_to: assigneeId,
        assigned_to_node: assigneeId ? orgNodes?.find(node => node.id === assigneeId) : undefined
      });
    }

    // Trigger callback if provided
    if (onTaskUpdated) {
      const updatedTask = taskList.find(t => t.id === taskId);
      if (updatedTask) {
        onTaskUpdated({
          ...updatedTask,
          assigned_to: assigneeId,
          assigned_to_node: assigneeId ? orgNodes?.find(node => node.id === assigneeId) : undefined
        });
      }
    }
  };

  // Apply filters and sorting
  const filteredAndSortedTasks = taskList
    .filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assigned_to && task.assigned_to?.toString() !== filters.assigned_to) return false;
      if (filters.initiative && task.initiative_id?.toString() !== filters.initiative) return false;
      if (filters.overdue && !isOverdue(task.due_date)) return false;
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
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle special sorting cases
      if (sortBy === 'due_date') {
        aValue = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        bValue = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
      }

      // Apply sorting direction
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Priority and status styling
  const PRIORITY_CLASS = {
    urgent: "bg-red-200 text-red-800",
    high: "bg-orange-200 text-orange-800",
    medium: "bg-yellow-200 text-yellow-800",
    low: "bg-green-200 text-green-800"
  };

  const STATUS_CLASS = {
    completed: "bg-green-200 text-green-800",
    in_progress: "bg-blue-200 text-blue-800",
    on_hold: "bg-yellow-200 text-yellow-800",
    cancelled: "bg-red-200 text-red-800",
    not_started: "bg-gray-200 text-gray-800"
  };

  // Format status and priority for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assigned_to: '',
      search: '',
      overdue: false,
      initiative: initiativeId ? String(initiativeId) : ''
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Task Management Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Badge variant="outline" className="text-xs">
            {filteredAndSortedTasks.length} task(s)
          </Badge>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center">
          <Plus size={16} className="mr-1" />
          New Task
        </Button>
      </div>

      {/* Create Task Form */}
      <TaskFormSheet
        open={isCreating}
        onClose={() => setIsCreating(false)}
        onTaskCreated={handleTaskCreated}
        initiatives={initiatives}
        orgNodes={orgNodes}
        initiativeId={initiativeId}
      />

      {/* Edit Task Form Sheet */}
      {editTask && (
        <TaskFormSheet
          open={!!editTask}
          onClose={() => setEditTask(null)}
          task={editTask}
          isEditing={true}
          initiatives={initiatives}
          orgNodes={orgNodes}
          initiativeId={editTask.initiative_id}
          onSuccess={(updatedTask) => {
            setEditTask(null);
            setTaskList(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
            if (onTaskUpdated) onTaskUpdated(updatedTask);
            setSelectedTask(updatedTask);
          }}
        />
      )}

      {/* Main Split View Container - use flex-1 to fill remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Task List */}
        <div className="w-1/3 flex flex-col border-r">
          {/* Search and Filters */}
          <div className="p-4 space-y-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <Dropdown
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'not_started', label: 'Not Started' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />

              {/* Priority Filter */}
              <Dropdown
                label="Priority"
                value={filters.priority}
                onChange={(value) => setFilters({ ...filters, priority: value })}
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' }
                ]}
              />

              {/* Assignee Filter */}
              <Dropdown
                label="Assignee"
                value={filters.assigned_to}
                onChange={(value) => setFilters({ ...filters, assigned_to: value })}
                options={[
                  { value: '', label: 'All Assignees' },
                  { value: 'unassigned', label: 'Unassigned' },
                  ...(orgNodes?.map(node => ({
                    value: node.id.toString(),
                    label: `${node.first_name} ${node.last_name}`
                  })) || [])
                ]}
              />

              {/* Overdue Filter */}
              <Button
                variant={filters.overdue ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, overdue: !filters.overdue })}
                className="flex items-center"
              >
                <Clock size={14} className={`mr-1 ${filters.overdue ? 'text-red-500' : ''}`} />
                Overdue
              </Button>

              {/* Clear Filters Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Task List - use flex-1 to fill remaining height */}
          <div className="flex-1 overflow-y-auto">
            {filteredAndSortedTasks.length > 0 ? (
              <div className="divide-y">
                {filteredAndSortedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedTask?.id === task.id ? 'bg-gray-100 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{task.title}</h3>
                      <Badge className={STATUS_CLASS[task.status]}>
                        {formatStatus(task.status)}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span className={isOverdue(task.due_date) ? "text-red-600 font-medium" : isDueToday(task.due_date) ? "text-yellow-600 font-medium" : isDueTomorrow(task.due_date) ? "text-blue-600 font-medium" : ""}>
                        {task.due_date ? formatDate(task.due_date) : "No due date"}
                      </span>
                      {isOverdue(task.due_date) && (
                        <Badge className="ml-2 bg-red-100 text-red-800 text-xs px-1">Overdue</Badge>
                      )}
                      {isDueToday(task.due_date) && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-1">Today</Badge>
                      )}
                      {isDueTomorrow(task.due_date) && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs px-1">Due Tomorrow</Badge>
                      )}
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <Badge variant="outline" className={PRIORITY_CLASS[task.priority]}>
                        {formatPriority(task.priority)}
                      </Badge>

                      <div className="flex items-center space-x-1">
                        {task.assigned_to_node ? (
                          <div className="flex items-center">
                            <User size={14} className="mr-1" />
                            <span className="text-xs">
                              {`${task.assigned_to_node.first_name} ${task.assigned_to_node.last_name}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </div>

                    <Progress
                      value={task.percentage_complete}
                      className="h-1.5 mt-2 bg-gray-100"
                      indicatorColor={
                        task.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No tasks match your filters</p>
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Task Detail */}
        <div className="w-2/3 overflow-y-auto">
          {selectedTask ? (
            <div className="p-6 h-full">
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('tasks.show', selectedTask.id))}>
                      <Eye size={14} className="mr-1" />
                      Full View
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setEditTask(selectedTask)}>
                      <FileText size={14} className="mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={STATUS_CLASS[selectedTask.status]}>
                    {formatStatus(selectedTask.status)}
                  </Badge>
                  <Badge variant="outline" className={PRIORITY_CLASS[selectedTask.priority]}>
                    {formatPriority(selectedTask.priority)}
                  </Badge>
                  {isOverdue(selectedTask.due_date) && (
                    <Badge className="bg-red-200 text-red-800">OVERDUE</Badge>
                  )}
                  {isDueToday(selectedTask.due_date) && (
                    <Badge className="bg-yellow-200 text-yellow-800">DUE TODAY</Badge>
                  )}
                  {isDueTomorrow(selectedTask.due_date) && (
                    <Badge className="bg-blue-200 text-blue-800">DUE TOMORROW</Badge>
                  )}
                  {selectedTask.tags?.map(tag => (
                    <Badge key={tag.id} variant="outline" className="bg-gray-100">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Due Date</h3>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-600" />
                    <span className={`${isOverdue(selectedTask.due_date) ? 'text-red-600 font-medium' : ''}`}>
                      {selectedTask.due_date ? formatDate(selectedTask.due_date) : "No due date"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Assignee</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User size={16} className="mr-2 text-gray-600" />
                      {selectedTask.assigned_to_node ? (
                        <span>{`${selectedTask.assigned_to_node.first_name} ${selectedTask.assigned_to_node.last_name}`}</span>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </div>

                    <AssigneeDropdown
                      taskId={selectedTask.id}
                      currentAssigneeId={selectedTask.assigned_to || undefined}
                      orgNodes={orgNodes || []}
                      onChange={handleTaskAssignment}
                      currentUser={currentUser}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Progress</h3>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={selectedTask.percentage_complete}
                      className="h-2.5 flex-1"
                      indicatorColor={selectedTask.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}
                    />
                    <span className="text-sm">{selectedTask.percentage_complete}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Initiative</h3>
                  <div className="flex items-center">
                    {selectedTask.initiative ? (
                      <a
                        href={route('initiatives.show', selectedTask.initiative.id)}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FileText size={16} className="mr-1" />
                        {selectedTask.initiative.title}
                      </a>
                    ) : (
                      <span className="text-gray-400">No initiative</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
                  {selectedTask.description ? (
                    <div className="prose max-w-none">
                      {selectedTask.description}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No description provided</p>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
                <NotesSection
                  modelType="task"
                  modelId={selectedTask.id}
                  initialNotes={selectedTask.notes || []}
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Select a task to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskSplitView;

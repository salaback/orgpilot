import { Inertia } from '@inertiajs/inertia';
import { AlertCircle, ArrowUpDown, Calendar, CheckCircle, Clock, FileText, MoreHorizontal, Plus, Search, Target, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TaskDetail from './task-detail';
import TaskFormSheet from './task-form';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu } from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Employee, Task } from '@/types';
import type { Initiative } from '@/features/initiatives/types';

interface TaskManagementProps {
    tasks?: Task[];
    initiatives?: Initiative[];
    employees?: Employee[];
    initiativeId?: number;
    showCreateForm?: boolean;
    onTaskCreated?: (task: Task) => void;
    onTaskUpdated?: (task: Task) => void;
}

const TaskManagement: React.FC<TaskManagementProps> = ({
    tasks = [],
    initiatives = [],
    employees = [],
    initiativeId,
    showCreateForm = false,
    onTaskCreated,
    onTaskUpdated,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
        initiative: '',
    });
    const [editTask, setEditTask] = useState<Task | null>(null);

    useEffect(() => {
        setTaskList(tasks);
    }, [tasks]);

    useEffect(() => {
        if (showCreateForm) {
            setIsCreating(true);
        }
    }, [showCreateForm]);

    useEffect(() => {
        setIsEditing(!!editTask);
    }, [editTask]);

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
        setTaskList((prev) => [task, ...prev]);
        setIsCreating(false);
        if (onTaskCreated) {
            onTaskCreated(task);
        }
    };

    // Enhanced filtering and sorting
    const filteredAndSortedTasks = taskList
        .filter((task) => {
            if (filters.status && task.status !== filters.status) return false;
            if (filters.priority && task.priority !== filters.priority) return false;
            if (filters.assigned_to && task.assigned_to?.toString() !== filters.assigned_to) return false;
            if (filters.initiative && task.initiative_id?.toString() !== filters.initiative) return false;
            if (filters.overdue && !isOverdue(task.due_date || '')) return false;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                return (
                    task.title.toLowerCase().includes(searchLower) ||
                    task.description?.toLowerCase().includes(searchLower) ||
                    task.assigned_to_node?.first_name.toLowerCase().includes(searchLower) ||
                    task.assigned_to_node?.last_name.toLowerCase().includes(searchLower)
                );
            }
            return true;
        })
        .sort((a, b) => {
            let aValue: string | number | undefined = a[sortBy];
            let bValue: string | number | undefined = b[sortBy];

            if (sortBy === 'due_date') {
                aValue = aValue ? new Date(aValue as string).getTime() : 0;
                bValue = bValue ? new Date(bValue as string).getTime() : 0;
            }

            if (sortBy === 'priority') {
                const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                aValue = typeof aValue === 'string' ? priorityOrder[aValue as keyof typeof priorityOrder] || 0 : 0;
                bValue = typeof bValue === 'string' ? priorityOrder[bValue as keyof typeof priorityOrder] || 0 : 0;
            }

            if (aValue === undefined || bValue === undefined) return 0;
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    // Task statistics
    const taskStats = {
        total: taskList.length,
        completed: taskList.filter((t) => t.status === 'completed').length,
        inProgress: taskList.filter((t) => t.status === 'in_progress').length,
        overdue: taskList.filter((t) => isOverdue(t.due_date || '')).length,
        avgProgress: taskList.length > 0 ? Math.round(taskList.reduce((sum, t) => sum + t.percentage_complete, 0) / taskList.length) : 0,
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

        Inertia.patch(
            '/tasks/bulk-update',
            {
                task_ids: selectedTasks,
                updates: { status },
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setTaskList((prev) => prev.map((t) => (selectedTasks.includes(t.id) ? { ...t, status: status as Task['status'] } : t)));
                    setSelectedTasks([]);
                },
            },
        );
    };

    const handleTaskSelect = (taskId: number, selected: boolean) => {
        if (selected) {
            setSelectedTasks((prev) => [...prev, taskId]);
        } else {
            setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
        }
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedTasks(filteredAndSortedTasks.map((t) => t.id));
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
            initiative: '',
        });
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== false);

    return (
        <div className="space-y-6">
            {/* Task Details Modal */}
            {selectedTask && (
                <TaskDetail
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onTaskUpdated={(updatedTask) => {
                        setTaskList((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
                        setSelectedTask(updatedTask);
                        if (onTaskUpdated) onTaskUpdated(updatedTask);
                    }}
                />
            )}

            {/* Header with Statistics */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Task Management</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track all tasks across your organization</p>
                </div>
                <Button onClick={() => setIsCreating(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{taskStats.total}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{taskStats.completed}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{taskStats.inProgress}</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{taskStats.overdue}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{taskStats.avgProgress}%</p>
                        </div>
                        <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <Input
                                placeholder="Search tasks, assignees, or descriptions..."
                                value={filters.search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={filters.status}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, status: e.target.value })}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
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
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, priority: e.target.value })}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                        >
                            <option value="">All Priority</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        <select
                            value={filters.assigned_to}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, assigned_to: e.target.value })}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                        >
                            <option value="">All Assignees</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.first_name} {employee.last_name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.initiative}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, initiative: e.target.value })}
                            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                        >
                            <option value="">All Initiatives</option>
                            {initiatives.map((initiative) => (
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
                            <Button variant="outline" size="sm" onClick={clearFilters} className="text-sm">
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">{selectedTasks.length} task(s) selected</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('completed')}>
                                Mark Complete
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('in_progress')}>
                                Mark In Progress
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedTasks([])}>
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
                                        className="flex h-auto items-center gap-1 p-0 text-sm font-medium"
                                    >
                                        Task
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('due_date')}
                                        className="flex h-auto items-center gap-1 p-0 text-sm font-medium"
                                    >
                                        Due Date
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Assignee</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('priority')}
                                        className="flex h-auto items-center gap-1 p-0 text-sm font-medium"
                                    >
                                        Priority
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('status')}
                                        className="flex h-auto items-center gap-1 p-0 text-sm font-medium"
                                    >
                                        Status
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('percentage_complete')}
                                        className="flex h-auto items-center gap-1 p-0 text-sm font-medium"
                                    >
                                        Progress
                                        <ArrowUpDown className="h-3 w-3" />
                                    </Button>
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
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
                                                    <Plus className="mr-2 h-4 w-4" />
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
                                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{task.initiative.title}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.due_date ? (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(task.due_date)}
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {task.assigned_to_node ? (
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {task.assigned_to_node.first_name} {task.assigned_to_node.last_name}
                                                </div>
                                            ) : (
                                                'Unassigned'
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    task.priority === 'urgent'
                                                        ? 'destructive'
                                                        : task.priority === 'high'
                                                          ? 'default'
                                                          : task.priority === 'medium'
                                                            ? 'secondary'
                                                            : 'outline'
                                                }
                                            >
                                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    task.status === 'completed'
                                                        ? 'default'
                                                        : task.status === 'in_progress'
                                                          ? 'secondary'
                                                          : task.status === 'on_hold'
                                                            ? 'outline'
                                                            : task.status === 'cancelled'
                                                              ? 'destructive'
                                                              : 'outline'
                                                }
                                            >
                                                {task.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Progress value={task.percentage_complete} className="w-16" />
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{task.percentage_complete}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenu.Trigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenu.Trigger>
                                                <DropdownMenu.Content>
                                                    <DropdownMenu.Item onClick={() => setSelectedTask(task)}>View Details</DropdownMenu.Item>
                                                    <DropdownMenu.Separator />
                                                    <DropdownMenu.Item onClick={() => setEditTask(task)}>Edit Task</DropdownMenu.Item>
                                                    <DropdownMenu.Item onClick={() => handleBulkStatusUpdate('completed')}>
                                                        Mark Complete
                                                    </DropdownMenu.Item>
                                                    <DropdownMenu.Item onClick={() => handleBulkStatusUpdate('in_progress')}>
                                                        Mark In Progress
                                                    </DropdownMenu.Item>
                                                    <DropdownMenu.Item onClick={() => handleBulkStatusUpdate('on_hold')}>
                                                        Put On Hold
                                                    </DropdownMenu.Item>
                                                </DropdownMenu.Content>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Task Form Sheet for Create */}
            <TaskFormSheet
                open={isCreating}
                onClose={() => setIsCreating(false)}
                title="Create New Task"
                size="lg"
                initiatives={initiatives}
                employees={employees}
                initiativeId={initiativeId}
                onSuccess={handleTaskCreated}
            />
            {/* Task Form Sheet for Edit */}
            {editTask && (
                <TaskFormSheet
                    open={isEditing}
                    onClose={() => setEditTask(null)}
                    title="Edit Task"
                    size="lg"
                    initiatives={initiatives}
                    employees={employees}
                    initiativeId={editTask.initiative_id}
                    task={editTask}
                    isEditing={true}
                    onSuccess={(updatedTask) => {
                        setIsEditing(false);
                        setEditTask(null);
                        setTaskList((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
                        if (onTaskUpdated) onTaskUpdated(updatedTask);
                    }}
                />
            )}
        </div>
    );
};

export default TaskManagement;

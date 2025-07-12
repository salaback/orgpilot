import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, ArrowUpDown, Calendar, CheckCircle, Clock, Eye, FileText, Plus, Search, Target, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TaskDetail from './task-detail';
import { TaskFormSheet } from './task-form';
import AssigneeDropdown from './ui/AssigneeDropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ConfirmationModal } from './ui/confirmation-modal';
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

interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}
interface PageProps {
    auth: { user: AuthUser };
    [key: string]: unknown;
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
    const { props } = usePage<PageProps>();
    const currentUser = props.auth?.user;

    const [isCreating, setIsCreating] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        assigned_to: '',
        search: '',
        overdue: false,
        initiative: '',
    });
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

    useEffect(() => {
        // setTaskList(tasks); // This line is removed as per the edit hint
    }, [tasks]);

    useEffect(() => {
        if (showCreateForm) {
            setIsCreating(true);
        }
    }, [showCreateForm]);

    // Filter and sort tasks
    const filteredAndSortedTasks = tasks.filter((task) => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.priority && task.priority !== filters.priority) return false;
        if (filters.assigned_to && task.assigned_to !== parseInt(filters.assigned_to)) return false;
        if (filters.initiative && task.initiative_id !== parseInt(filters.initiative)) return false;
        if (filters.overdue && !isOverdue(task.due_date || '')) return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = 
                task.title.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower) ||
                (task.assigned_to && employees.find(e => e.id === task.assigned_to)?.first_name?.toLowerCase().includes(searchLower)) ||
                (task.assigned_to && employees.find(e => e.id === task.assigned_to)?.last_name?.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
        }
        return true;
    }).sort((a, b) => {
        // Simple sorting by title for now
        return a.title.localeCompare(b.title);
    });

    // Helper functions for date calculations
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

    // Task statistics
    const taskStats = {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        overdue: tasks.filter((t) => isOverdue(t.due_date || '')).length,
        avgProgress: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + (t.percentage_complete || 0), 0) / tasks.length) : 0,
    };

    const handleSort = (column: string) => {
        // Simple sorting implementation
        console.log('Sort by:', column);
    };

    const handleBulkStatusUpdate = (status: string) => {
        if (selectedTasks.length === 0) return;

        // Implementation for bulk status update
        console.log('Bulk status update:', status, selectedTasks);
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

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    const formatDateSafe = (dateString: string | undefined) => {
        if (!dateString) return 'No due date';
        return formatDate(dateString);
    };

    // Update handleDueDateChange signature
    type DueDateType = string | null | undefined;
    const handleDueDateChange = (taskId: number, newDate: DueDateType) => {
        // Implementation for due date change
        console.log('Due date change:', taskId, newDate);
    };

    // Update handleAssigneeChange signature
    type AssigneeIdType = number | null;
    const handleAssigneeChange = (taskId: number, assigneeId: AssigneeIdType) => {
        // Implementation for assignee change
        console.log('Assignee change:', taskId, assigneeId);
    };

    const handlePriorityChange = (taskId: number, priority: Task['priority']) => {
        // Implementation for priority change
        console.log('Priority change:', taskId, priority);
    };

    const handleStatusChange = (taskId: number, status: Task['status']) => {
        // Implementation for status change
        console.log('Status change:', taskId, status);
    };

    const handleProgressChange = (taskId: number, progress: number) => {
        // Implementation for progress change
        console.log('Progress change:', taskId, progress);
    };

    const handleTaskCreated = (task: Task) => {
        // setTaskList((prev) => [task, ...prev]); // This line is removed as per the edit hint
        setIsCreating(false);
        if (onTaskCreated) {
            onTaskCreated(task);
        }
    };

    const handleSaveTaskEdit = async () => {
        if (!selectedTaskForEdit) return;

        try {
            const response = await axios.patch(`/tasks/${selectedTaskForEdit.id}`, {
                title: editForm.title,
                description: editForm.description,
            });

            // setTaskList((prev) => // This line is removed as per the edit hint
            //     prev.map((t) => (t.id === selectedTaskForEdit.id ? { ...t, title: editForm.title, description: editForm.description } : t)),
            // );

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
            await Promise.all(selectedTasks.map((taskId) => axios.delete(`/tasks/${taskId}`)));

            // Remove the deleted tasks from the list
            // setTaskList((prev) => prev.filter((task) => !selectedTasks.includes(task.id))); // This line is removed as per the edit hint

            // Clear the selection
            setSelectedTasks([]);

            // Close the confirmation modal
            setIsConfirmingDelete(false);
        } catch (error) {
            console.error('Error deleting tasks', error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-none space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Task Details Modal */}
                {selectedTask && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="m-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Task Details</h3>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-gray-700">
                                    ×
                                </Button>
                            </div>
                            <TaskDetail task={selectedTask} />
                        </div>
                    </div>
                )}

                {/* Task Edit Modal */}
                {selectedTaskForEdit && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="m-4 w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
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
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
                                    <Input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        placeholder="Enter task title..."
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        placeholder="Enter task description..."
                                        rows={4}
                                        className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
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
                                    className="bg-blue-600 text-white hover:bg-blue-700"
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
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
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
                                onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
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
                                onChange={(e) => setFilters({ ...filters, initiative: e.target.value })}
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
                                <Button size="sm" variant="destructive" onClick={() => setIsConfirmingDelete(true)}>
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete
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
                                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                                                            className="text-left font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                                                            onClick={() => setSelectedTaskForEdit(task)}
                                                        >
                                                            {task.title}
                                                        </button>
                                                        {task.initiative && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{task.initiative.title}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <Calendar className="h-3 w-3" />
                                                            <span
                                                                className={
                                                                    isOverdue(task.due_date || '')
                                                                        ? 'font-medium text-red-600'
                                                                        : isDueToday(task.due_date || '')
                                                                          ? 'font-medium text-yellow-600'
                                                                          : isDueTomorrow(task.due_date || '')
                                                                            ? 'font-medium text-blue-600'
                                                                            : ''
                                                                }
                                                            >
                                                                {task.due_date ? formatDateSafe(task.due_date) : 'No due date'}
                                                            </span>
                                                            {isOverdue(task.due_date || '') && (
                                                                <Badge className="ml-2 bg-red-100 px-1 text-xs text-red-800">Overdue</Badge>
                                                            )}
                                                            {isDueToday(task.due_date || '') && (
                                                                <Badge className="ml-2 bg-yellow-100 px-1 text-xs text-yellow-800">Today</Badge>
                                                            )}
                                                            {isDueTomorrow(task.due_date || '') && (
                                                                <Badge className="ml-2 bg-blue-100 px-1 text-xs text-blue-800">Tomorrow</Badge>
                                                            )}
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-64 p-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Due Date</span>
                                                                {task.due_date && (
                                                                    <button
                                                                        className="text-xs text-red-600 hover:underline dark:text-red-400"
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
                                                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                                            />
                                                            <div className="space-y-2">
                                                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                    Quick options:
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[
                                                                        { label: 'Today', days: 0 },
                                                                        { label: 'Tomorrow', days: 1 },
                                                                        { label: 'In 3 days', days: 3 },
                                                                        { label: 'Next week', days: 7 },
                                                                        { label: 'In 2 weeks', days: 14 },
                                                                        { label: 'Next month', days: 30 },
                                                                    ].map((option) => {
                                                                        const date = new Date();
                                                                        date.setDate(date.getDate() + option.days);
                                                                        const dateString = date.toISOString().split('T')[0];
                                                                        return (
                                                                            <button
                                                                                key={option.label}
                                                                                className="rounded border border-gray-300 px-2 py-1 text-center text-xs transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                                                                                onClick={() => handleDueDateChange(task.id, dateString)}
                                                                            >
                                                                                {option.label}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="p-0">
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
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-40">
                                                        {['urgent', 'high', 'medium', 'low'].map((p) => {
                                                            const priorityConfig = {
                                                                urgent: { color: 'bg-red-500', icon: '🔴', label: 'Urgent' },
                                                                high: { color: 'bg-orange-500', icon: '🟠', label: 'High' },
                                                                medium: { color: 'bg-yellow-500', icon: '🟡', label: 'Medium' },
                                                                low: { color: 'bg-green-500', icon: '🟢', label: 'Low' },
                                                            };
                                                            const config = priorityConfig[p as keyof typeof priorityConfig];
                                                            return (
                                                                <DropdownMenuItem
                                                                    key={p}
                                                                    onClick={() => handlePriorityChange(task.id, p as Task['priority'])}
                                                                >
                                                                    <div className={`h-3 w-3 rounded-full ${config.color}`}></div>
                                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {config.label}
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            );
                                                        })}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="p-0">
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
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-48">
                                                        {['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'].map((s) => {
                                                            const statusConfig = {
                                                                not_started: { icon: '⚪', label: 'Not Started', color: 'text-gray-600' },
                                                                in_progress: { icon: '🔵', label: 'In Progress', color: 'text-blue-600' },
                                                                completed: { icon: '✅', label: 'Completed', color: 'text-green-600' },
                                                                on_hold: { icon: '⏸️', label: 'On Hold', color: 'text-yellow-600' },
                                                                cancelled: { icon: '❌', label: 'Cancelled', color: 'text-red-600' },
                                                            };
                                                            const config = statusConfig[s as keyof typeof statusConfig];
                                                            return (
                                                                <DropdownMenuItem
                                                                    key={s}
                                                                    onClick={() => handleStatusChange(task.id, s as Task['status'])}
                                                                >
                                                                    <span className="text-base">{config.icon}</span>
                                                                    <span className={`font-medium ${config.color} dark:text-gray-100`}>
                                                                        {config.label}
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            );
                                                        })}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-4 py-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                                                            <Progress value={task.percentage_complete} className="w-16" />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {task.percentage_complete}%
                                                            </span>
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-64 p-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Progress</span>
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
                                                                className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                                                                style={{
                                                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${task.percentage_complete}%, #e5e7eb ${task.percentage_complete}%, #e5e7eb 100%)`,
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
                                                                {[0, 25, 50, 75, 100].map((percent) => (
                                                                    <button
                                                                        key={percent}
                                                                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs transition-colors hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                                                                        onClick={() => handleProgressChange(task.id, percent)}
                                                                    >
                                                                        {percent}%
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Navigate to the individual task page
                                                        router.visit(`/tasks/${task.id}`);
                                                    }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <Eye className="h-3 w-3" />
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

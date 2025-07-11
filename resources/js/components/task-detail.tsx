import { Inertia } from '@inertiajs/inertia';
import React, { useState } from 'react';
import NotesSection from './notes-section';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Employee, Task } from '@/types';

interface TaskDetailProps {
    task: Task;
    employees?: Employee[];
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, employees = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date || '',
        priority: task.priority,
        status: task.status,
        percentage_complete: task.percentage_complete,
    });

    const PRIORITY_CLASS = {
        urgent: 'bg-red-600 dark:bg-red-500 text-white',
        high: 'bg-orange-500 dark:bg-orange-400 text-white',
        medium: 'bg-yellow-500 dark:bg-yellow-400 text-white',
        low: 'bg-green-600 dark:bg-green-400 text-white',
    };
    const STATUS_CLASS = {
        completed: 'bg-green-600 dark:bg-green-500 text-white',
        in_progress: 'bg-blue-600 dark:bg-blue-400 text-white',
        on_hold: 'bg-yellow-500 dark:bg-yellow-400 text-white',
        cancelled: 'bg-red-600 dark:bg-red-500 text-white',
        not_started: 'bg-gray-500 dark:bg-gray-400 text-white',
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

    const handleSave = () => {
        // Create a sanitized version of the data
        const sanitizedData = {
            ...editData,
            // Ensure assigned_to is just an ID or null
            assigned_to: editData.assigned_to && typeof editData.assigned_to === 'object' ? editData.assigned_to.id : editData.assigned_to || null,
            redirect_back: true,
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
            },
        });
    };

    const handleProgressChange = (percentage: number) => {
        Inertia.patch(
            `/tasks/${task.id}/progress`,
            {
                percentage_complete: percentage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditData({ ...editData, percentage_complete: percentage });
                },
            },
        );
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
                },
            });
        }
    };

    return (
        <div className="mx-auto max-w-5xl p-5">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {task.title}
                        {isOverdue(task.due_date || '') && (
                            <Badge className="ml-3 rounded bg-red-600 px-2 py-1 text-xs text-white dark:bg-red-500">OVERDUE</Badge>
                        )}
                        {isDueToday(task.due_date || '') && (
                            <Badge className="ml-3 rounded bg-yellow-600 px-2 py-1 text-xs text-white dark:bg-yellow-500">DUE TODAY</Badge>
                        )}
                        {isDueTomorrow(task.due_date || '') && (
                            <Badge className="ml-3 rounded bg-blue-600 px-2 py-1 text-xs text-white dark:bg-blue-500">DUE TOMORROW</Badge>
                        )}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`rounded px-2 py-1 text-xs ${PRIORITY_CLASS[task.priority]}`}>{task.priority.toUpperCase()} PRIORITY</Badge>
                        <Badge className={`rounded px-2 py-1 text-xs ${STATUS_CLASS[task.status]}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {task.initiative && (
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Initiative:{' '}
                                <a href={`/initiatives/${task.initiative.id}`} className="text-blue-600 underline dark:text-blue-400">
                                    {task.initiative.title}
                                </a>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isEditing ? (
                        <>
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="rounded-md border-none bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="rounded-md border-none bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                                Delete
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleSave}
                                className="rounded-md border-none bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
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
                                        percentage_complete: task.percentage_complete,
                                    });
                                }}
                                className="rounded-md border-none bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2">
                    {/* Description */}
                    <Card className="mb-5 p-5">
                        <h3 className="mb-3 text-lg font-semibold">Description</h3>
                        {isEditing ? (
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                placeholder="Task description..."
                                className="min-h-[120px] w-full resize-y rounded-md border-2 border-blue-600 bg-white p-3 text-gray-900 dark:border-blue-400 dark:bg-gray-900 dark:text-gray-100"
                            />
                        ) : (
                            <p className={`text-gray-900 dark:text-gray-100 ${task.description ? 'font-normal' : 'font-italic text-gray-500'}`}>
                                {task.description || 'No description provided.'}
                            </p>
                        )}
                    </Card>

                    {/* Progress */}
                    <Card className="mb-5 p-5">
                        <h3 className="mb-3 text-lg font-semibold">Progress</h3>

                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Completion</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{editData.percentage_complete}%</span>
                        </div>

                        <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-full bg-blue-600 transition-all dark:bg-blue-500"
                                style={{ width: `${editData.percentage_complete}%` }}
                            />
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

                        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </Card>

                    {/* Notes Section */}
                    <NotesSection notes={task.notes || []} entityType="task" entityId={task.id} employees={employees} />
                </div>

                {/* Sidebar */}
                <div>
                    <Card className="mb-5 p-5">
                        <h3 className="mb-4 text-lg font-semibold">Task Details</h3>

                        <div className="flex flex-col gap-4">
                            {/* Assigned To */}
                            <div>
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Assigned To</label>
                                {isEditing ? (
                                    <select
                                        value={editData.assigned_to}
                                        onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                                        className="w-full rounded-md border-2 border-blue-600 bg-white p-2 text-gray-900 dark:border-blue-400 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Unassigned</option>
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.first_name} {employee.last_name}
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
                                                    className="h-6 w-6 rounded-full"
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
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Due Date</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editData.due_date}
                                        onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                                        className="w-full rounded-md border-2 border-blue-600 bg-white p-2 text-gray-900 dark:border-blue-400 dark:bg-gray-900 dark:text-gray-100"
                                    />
                                ) : (
                                    <div className="text-gray-900 dark:text-gray-100">
                                        {task.due_date ? formatDate(task.due_date) : 'No due date'}
                                    </div>
                                )}
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Priority</label>
                                {isEditing ? (
                                    <select
                                        value={editData.priority}
                                        onChange={(e) => setEditData({ ...editData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                                        className="w-full rounded-md border-2 border-blue-600 bg-white p-2 text-gray-900 dark:border-blue-400 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                ) : (
                                    <Badge className={`rounded px-2 py-1 text-xs ${PRIORITY_CLASS[task.priority]}`}>
                                        {task.priority.toUpperCase()}
                                    </Badge>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Status</label>
                                {isEditing ? (
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value as 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' })}
                                        className="w-full rounded-md border-2 border-blue-600 bg-white p-2 text-gray-900 dark:border-blue-400 dark:bg-gray-900 dark:text-gray-100"
                                    >
                                        <option value="not_started">Not Started</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                ) : (
                                    <Badge className={`rounded px-2 py-1 text-xs ${STATUS_CLASS[task.status]}`}>
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                )}
                            </div>

                            {/* Created By */}
                            <div>
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Created By</label>
                                <div className="text-gray-900 dark:text-gray-100">
                                    {task.created_by_user ? `${task.created_by_user.first_name} ${task.created_by_user.last_name}` : 'Unknown'}
                                </div>
                            </div>

                            {/* Created At */}
                            <div>
                                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Created</label>
                                <div className="text-gray-900 dark:text-gray-100">{formatDate(task.created_at)}</div>
                            </div>

                            {/* Updated At */}
                            {task.updated_at !== task.created_at && (
                                <div>
                                    <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Last Updated</label>
                                    <div className="text-gray-900 dark:text-gray-100">{formatDate(task.updated_at)}</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <Card className="p-5">
                            <h3 className="mb-3 text-lg font-semibold">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        className="rounded bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs text-white"
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

import { Inertia } from '@inertiajs/inertia';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Employee, Task } from '@/types';

interface TaskFormProps {
    task?: Task;
    onSave: (task: Task) => void;
    onCancel: () => void;
    employees: Employee[];
    initiatives: Array<{
        id: number;
        title: string;
        status: string;
    }>;
}

interface TaskFormSheetProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (task: Task) => void;
    initiatives?: Array<{
        id: number;
        title: string;
        status: string;
    }>;
    employees?: Employee[];
    initiativeId?: number;
}

const TaskForm: React.FC<Omit<TaskFormProps, 'open' | 'onClose'>> = ({
    initiatives = [],
    employees = [],
    task,
    onSave,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        initiative_id: task?.initiative_id || '',
        assigned_to: task?.assigned_to || '',
        due_date: task?.due_date || '',
        priority: task?.priority || 'medium',
        status: task?.status || 'not_started',
        percentage_complete: task?.percentage_complete || 0,
        tags: task?.tags ? (Array.isArray(task.tags) ? task.tags.map((t: { name: string } | string) => typeof t === 'string' ? t : t.name) : []) : [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Add a type guard for Task
    function isTask(obj: unknown): obj is Task {
        return typeof obj === 'object' && obj !== null && 'id' in obj && typeof (obj as Record<string, unknown>).id === 'number' && 'title' in obj && typeof (obj as Record<string, unknown>).title === 'string';
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setErrors({ title: 'Title is required' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        // Ensure initiativeId is prioritized over form state when available
        const taskData = {
            ...formData,
            initiative_id: formData.initiative_id || null,
            assigned_to: formData.assigned_to || null,
            due_date: formData.due_date || null,
            redirect_back: !!task?.initiative_id, // Add redirect_back parameter when creating from an initiative
        };

        if (task?.id) {
            Inertia.patch(`/tasks/${task.id}`, taskData, {
                onSuccess: (page) => {
                    if (isTask(page.props.task)) {
                        onSave(page.props.task);
                    }
                },
                onError: (errors) => {
                    setErrors(errors);
                    console.error('Failed to update task:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } else {
            Inertia.post('/tasks', taskData, {
                onSuccess: (page) => {
                    setFormData({
                        title: '',
                        description: '',
                        initiative_id: '',
                        assigned_to: '',
                        due_date: '',
                        priority: 'medium',
                        status: 'not_started',
                        percentage_complete: 0,
                        tags: [],
                    });

                    if (isTask(page.props.task)) {
                        onSave(page.props.task);
                    }
                },
                onError: (errors) => {
                    setErrors(errors);
                    console.error('Failed to create task:', errors);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <div className="flex flex-1 flex-col gap-5">
                {/* Title */}
                <div>
                    <Label htmlFor="title" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                        Task Title *
                    </Label>
                    <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('title', e.target.value)}
                        placeholder="Enter task title..."
                        className={`w-full rounded-md border-2 px-3 py-2 text-base transition-colors focus:border-blue-500 focus:outline-none ${errors.title ? 'border-red-500' : 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'}`}
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                    <Label htmlFor="description" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                        Description
                    </Label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData('description', e.target.value)}
                        placeholder="Describe the task..."
                        className="font-inherit resize-vertical min-h-[100px] w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Initiative */}
                <div>
                    <Label htmlFor="initiative" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                        Initiative
                    </Label>
                    <select
                        id="initiative"
                        value={formData.initiative_id}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('initiative_id', e.target.value)}
                        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">No Initiative</option>
                        {initiatives.map((initiative) => (
                            <option key={initiative.id} value={initiative.id}>
                                {initiative.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assigned To */}
                <div>
                    <Label htmlFor="assignee" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                        Assign To
                    </Label>
                    <select
                        id="assignee"
                        value={formData.assigned_to}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('assigned_to', e.target.value)}
                        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                        <option value="">Unassigned</option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.first_name} {employee.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Due Date */}
                <div>
                    <Label htmlFor="due_date" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                        Due Date
                    </Label>
                    <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('due_date', e.target.value)}
                        className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Priority and Status Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="priority" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                            Priority
                        </Label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('priority', e.target.value)}
                            className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="status" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                            Status
                        </Label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData('status', e.target.value)}
                            className="w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-base text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                        >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on_hold">On Hold</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Initial Progress */}
                <div>
                    <Label htmlFor="progress" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
                        Initial Progress: {formData.percentage_complete}%
                    </Label>
                    <input
                        id="progress"
                        type="range"
                        min="0"
                        max="100"
                        value={formData.percentage_complete}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData('percentage_complete', e.target.value)}
                        className="h-1.5 w-full appearance-none rounded bg-gray-200 focus:outline-none dark:bg-gray-700"
                    />
                    <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>
            {/* Footer Actions */}
            <div className="mt-5 flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title.trim()}
                    className={`rounded-md px-5 py-2 text-base font-medium text-white transition-colors ${formData.title.trim() && !isSubmitting ? 'cursor-pointer bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400'} ${isSubmitting ? 'opacity-70' : ''}`}
                >
                    {isSubmitting ? (task?.id ? 'Updating...' : 'Creating...') : task?.id ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
};

const TaskFormSheet: React.FC<TaskFormSheetProps> = ({
    open,
    onClose,
    onSuccess,
    initiatives = [],
    employees = []
}) => {
    const handleSave = (task: Task) => {
        if (onSuccess) {
            onSuccess(task);
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="w-[600px] sm:w-[700px]">
                <SheetHeader>
                    <SheetTitle>Create New Task</SheetTitle>
                    <SheetDescription>
                        Create a new task for your team. Fill in the details below.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 px-6">
                    <TaskForm
                        initiatives={initiatives}
                        employees={employees}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default TaskForm;
export { TaskFormSheet };

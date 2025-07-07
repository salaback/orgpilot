import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SheetPanel } from './sheet-panel';

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

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  initiatives?: Initiative[];
  orgNodes?: OrgNode[];
  initiativeId?: number;
  onSuccess?: (task: any) => void;
  task?: any;
  isEditing?: boolean;
}

const TaskForm: React.FC<Omit<TaskFormProps, 'open' | 'onClose'>> = ({
  initiatives = [],
  orgNodes = [],
  initiativeId,
  onSuccess,
  task,
  isEditing
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    initiative_id: task?.initiative_id || initiativeId || '',
    assigned_to: task?.assigned_to || '',
    due_date: task?.due_date || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'not_started',
    percentage_complete: task?.percentage_complete || 0,
    tags: task?.tags ? task.tags.map((t: any) => t.name) : []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
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
      initiative_id: initiativeId || formData.initiative_id || null,
      assigned_to: formData.assigned_to || null,
      due_date: formData.due_date || null,
      redirect_back: !!initiativeId, // Add redirect_back parameter when creating from an initiative
    };

    if (isEditing && task?.id) {
      Inertia.patch(`/tasks/${task.id}`, taskData, {
        onSuccess: (page) => {
          if (onSuccess && page.props.task) {
            onSuccess(page.props.task);
          }
        },
        onError: (errors) => {
          setErrors(errors);
          console.error('Failed to update task:', errors);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } else {
      Inertia.post('/tasks', taskData, {
        onSuccess: (page) => {
          setFormData({
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

          if (onSuccess && page.props.task) {
            onSuccess(page.props.task);
          }
        },
        onError: (errors) => {
          setErrors(errors);
          console.error('Failed to create task:', errors);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 flex flex-col gap-5">
        {/* Title */}
        <div>
          <Label htmlFor="title" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
            Task Title *
          </Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            placeholder="Enter task title..."
            className={`w-full border-2 rounded-md px-3 py-2 text-base focus:outline-none focus:border-blue-500 transition-colors ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'}`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description" className="mb-1.5 block font-medium text-gray-700 dark:text-gray-200">
            Description
          </Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Describe the task..."
            className="w-full min-h-[100px] px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-md text-base font-inherit resize-vertical focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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
            onChange={(e) => updateFormData('initiative_id', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-md text-base focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
          >
            <option value="">No Initiative</option>
            {initiatives.map(initiative => (
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
            onChange={(e) => updateFormData('assigned_to', e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-md text-base focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
          >
            <option value="">Unassigned</option>
            {orgNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.first_name} {node.last_name}
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
            onChange={(e) => updateFormData('due_date', e.target.value)}
            className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-base focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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
              onChange={(e) => updateFormData('priority', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-md text-base focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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
              onChange={(e) => updateFormData('status', e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-md text-base focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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
            onChange={(e) => updateFormData('percentage_complete', parseInt(e.target.value))}
            className="w-full h-1.5 rounded bg-gray-200 dark:bg-gray-700 appearance-none focus:outline-none"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-5 flex gap-3 justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          className={`text-white rounded-md px-5 py-2 text-base font-medium transition-colors ${formData.title.trim() && !isSubmitting ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'} ${isSubmitting ? 'opacity-70' : ''}`}
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};

export const TaskFormSheet: React.FC<TaskFormProps> = ({ open, onClose, isEditing, task, ...props }) => {
  return (
    <SheetPanel
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      description={isEditing ? 'Edit the details of your task.' : 'Add a new task to your workspace.'}
      footer={null}
    >
      <TaskForm {...props} isEditing={isEditing} task={task} />
    </SheetPanel>
  );
};

export default TaskFormSheet;

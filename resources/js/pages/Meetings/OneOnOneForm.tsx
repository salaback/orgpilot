import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { addDays, format } from 'date-fns';
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React, { useState } from 'react';

interface Task {
    id?: number;
    description: string;
    assigned_to: number;
    due_date: string | null;
    status: string;
    task_type: string;
}

interface Goal {
    id: number;
    title: string;
    status: string;
    selected?: boolean;
}

interface Initiative {
    id: number;
    title: string;
    status: string;
    selected?: boolean;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    title?: string;
    photo_url?: string;
}

interface OneOnOneFormProps {
    directReport: User;
    meeting?: {
        id: number;
        meeting_time: string;
        location: string;
        agenda: string;
        notes: string;
        summary: string;
        tasks: Task[];
        goals?: Goal[];
        initiatives?: Initiative[];
        title?: string;
        duration_minutes?: number;
    };
    incompleteTasks?: Task[];
    availableUsers: User[];
    availableGoals: Goal[];
    availableInitiatives: Initiative[];
    isEditing: boolean;
}

const OneOnOneForm: React.FC<OneOnOneFormProps> = ({
    directReport,
    meeting,
    incompleteTasks = [],
    availableUsers,
    availableGoals = [],
    availableInitiatives = [],
    isEditing,
}) => {
    const [selectedGoals, setSelectedGoals] = useState<number[]>(meeting?.goals?.map((goal) => goal.id) || []);

    const [selectedInitiatives, setSelectedInitiatives] = useState<number[]>(meeting?.initiatives?.map((initiative) => initiative.id) || []);

    // Initialize form with default values or meeting data if editing
    const { data, setData, post, put, processing, errors } = useForm({
        title: meeting?.title || `1:1 Meeting with ${directReport.full_name}`,
        type: 'one_on_one', // Specific to one-on-one meetings
        meeting_time: meeting ? format(new Date(meeting.meeting_time), 'yyyy-MM-dd HH:mm:ss') : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        duration_minutes: meeting?.duration_minutes || 30,
        location: meeting?.location || '',
        agenda: meeting?.agenda || '',
        notes: meeting?.notes || '',
        summary: meeting?.summary || '',
        participants: [{ id: directReport.id }], // The direct report is the participant
        tasks: meeting?.tasks || [],
        goals: selectedGoals,
        initiatives: selectedInitiatives,
    });

    const [includePreviousTasks, setIncludePreviousTasks] = useState(false);

    const addEmptyTask = () => {
        setData('tasks', [
            ...data.tasks,
            {
                description: '',
                assigned_to: directReport.id,
                due_date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                status: 'pending',
                task_type: 'action_item',
            },
        ]);
    };

    const removeTask = (index: number) => {
        setData(
            'tasks',
            data.tasks.filter((_, i) => i !== index),
        );
    };

    const updateTask = (index: number, field: string, value: string | number | boolean | undefined) => {
        const updatedTasks = [...data.tasks];
        updatedTasks[index] = { ...updatedTasks[index], [field]: value };
        setData('tasks', updatedTasks);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && meeting) {
            put(`/meetings/${meeting.id}`);
        } else {
            post('/meetings');
        }
    };

    const handleGoalChange = (goalId: number, checked: boolean) => {
        if (checked) {
            setSelectedGoals([...selectedGoals, goalId]);
            setData('goals', [...selectedGoals, goalId]);
        } else {
            const filtered = selectedGoals.filter((id) => id !== goalId);
            setSelectedGoals(filtered);
            setData('goals', filtered);
        }
    };

    const handleInitiativeChange = (initiativeId: number, checked: boolean) => {
        if (checked) {
            setSelectedInitiatives([...selectedInitiatives, initiativeId]);
            setData('initiatives', [...selectedInitiatives, initiativeId]);
        } else {
            const filtered = selectedInitiatives.filter((id) => id !== initiativeId);
            setSelectedInitiatives(filtered);
            setData('initiatives', filtered);
        }
    };

    const handleIncludePreviousTasks = (checked: boolean) => {
        setIncludePreviousTasks(checked);
        if (checked && incompleteTasks.length > 0) {
            setData('tasks', [...data.tasks, ...incompleteTasks]);
        } else {
            // Remove previously added incomplete tasks
            // This is a simplified approach; in a real app, you would need to track which ones were added
            setData('tasks', meeting?.tasks || []);
        }
    };

    // Parse the date and time for the DatePicker and TimeInput components
    const meetingDate = data.meeting_time ? new Date(data.meeting_time) : new Date();

    // Handle date change
    const handleDateChange = (date: Date | undefined) => {
        if (!date) return;

        const currentDate = data.meeting_time ? new Date(data.meeting_time) : new Date();
        const newDateTime = new Date(date);
        newDateTime.setHours(currentDate.getHours(), currentDate.getMinutes(), 0, 0);

        setData('meeting_time', format(newDateTime, 'yyyy-MM-dd HH:mm:ss'));
    };

    // Handle time change
    const handleTimeChange = (timeString: string) => {
        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            const currentDate = data.meeting_time ? new Date(data.meeting_time) : new Date();
            currentDate.setHours(hours, minutes, 0, 0);

            setData('meeting_time', format(currentDate, 'yyyy-MM-dd HH:mm:ss'));
        } catch (error) {
            console.error('Invalid time format', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Meeting Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CalendarIcon className="mr-2 h-5 w-5" />
                            Meeting Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Meeting title" />
                            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <input
                                    id="date"
                                    type="date"
                                    value={format(meetingDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const [year, month, day] = e.target.value.split('-').map(Number);
                                        const newDate = new Date(meetingDate);
                                        newDate.setFullYear(year, month - 1, day);
                                        handleDateChange(newDate);
                                    }}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                                {errors.meeting_time && <p className="text-sm text-red-500">{errors.meeting_time}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Time</Label>
                                <input
                                    id="time"
                                    type="time"
                                    value={format(meetingDate, 'HH:mm')}
                                    onChange={(e) => handleTimeChange(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                            <Input
                                id="duration_minutes"
                                type="number"
                                min="15"
                                step="15"
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', parseInt(e.target.value))}
                            />
                            {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes}</p>}
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="Office Room 101 or Zoom Link"
                            />
                            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Agenda & Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agenda & Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="agenda">Agenda</Label>
                            <Textarea
                                id="agenda"
                                value={data.agenda}
                                onChange={(e) => setData('agenda', e.target.value)}
                                placeholder="Meeting agenda topics"
                                rows={4}
                            />
                            {errors.agenda && <p className="text-sm text-red-500">{errors.agenda}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Any notes for the meeting"
                                rows={4}
                            />
                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Items */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Action Items</CardTitle>
                    <Button type="button" onClick={addEmptyTask} variant="outline" size="sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Action Item
                    </Button>
                </CardHeader>
                <CardContent>
                    {incompleteTasks.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="includePreviousTasks" checked={includePreviousTasks} onCheckedChange={handleIncludePreviousTasks} />
                                <Label htmlFor="includePreviousTasks">
                                    Include {incompleteTasks.length} incomplete action items from previous meetings
                                </Label>
                            </div>
                        </div>
                    )}

                    {data.tasks.length === 0 ? (
                        <p className="py-4 text-center text-gray-500">No action items yet. Add some using the button above.</p>
                    ) : (
                        <div className="space-y-4">
                            {data.tasks.map((task, index) => (
                                <div key={index} className="grid grid-cols-1 items-start gap-4 border-b pb-4 md:grid-cols-[1fr,auto,auto,auto]">
                                    <div className="space-y-2">
                                        <Label htmlFor={`task-${index}-description`}>Description</Label>
                                        <Textarea
                                            id={`task-${index}-description`}
                                            value={task.description}
                                            onChange={(e) => updateTask(index, 'description', e.target.value)}
                                            placeholder="Task description"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`task-${index}-assigned_to`}>Assigned To</Label>
                                        <Select
                                            value={task.assigned_to?.toString()}
                                            onValueChange={(value) => updateTask(index, 'assigned_to', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select person" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.first_name} {user.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`task-${index}-due_date`}>Due Date</Label>
                                        <input
                                            id={`task-${index}-due_date`}
                                            type="date"
                                            value={task.due_date || ''}
                                            onChange={(e) => updateTask(index, 'due_date', e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                                        />
                                    </div>
                                    <Button type="button" onClick={() => removeTask(index)} variant="ghost" size="icon" className="mt-8">
                                        <TrashIcon className="h-4 w-4" />
                                        <span className="sr-only">Remove action item</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Related Goals & Initiatives */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Goals */}
                {availableGoals.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {availableGoals.map((goal) => (
                                    <div key={goal.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`goal-${goal.id}`}
                                            checked={selectedGoals.includes(goal.id)}
                                            onCheckedChange={(checked) => handleGoalChange(goal.id, checked === true)}
                                        />
                                        <Label htmlFor={`goal-${goal.id}`} className="flex-1">
                                            {goal.title}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Initiatives */}
                {availableInitiatives.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Initiatives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {availableInitiatives.map((initiative) => (
                                    <div key={initiative.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`initiative-${initiative.id}`}
                                            checked={selectedInitiatives.includes(initiative.id)}
                                            onCheckedChange={(checked) => handleInitiativeChange(initiative.id, checked === true)}
                                        />
                                        <Label htmlFor={`initiative-${initiative.id}`} className="flex-1">
                                            {initiative.title}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {isEditing ? 'Update Meeting' : 'Schedule Meeting'}
                </Button>
            </div>
        </form>
    );
};

export default OneOnOneForm;

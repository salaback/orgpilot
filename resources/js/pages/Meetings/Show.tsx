import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CalendarIcon, ClockIcon, EditIcon, PlusIcon, SaveIcon, UsersIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';

interface Meeting {
    id: number;
    title: string;
    meeting_time: string;
    notes?: string;
    created_by: {
        id: number;
        first_name: string;
        last_name: string;
    };
    meeting_series?: {
        id: number;
        title: string;
    };
    participants: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
    tasks: Array<{
        id: number;
        title: string;
        description?: string;
        status: string;
        assigned_to?: {
            id: number;
            first_name: string;
            last_name: string;
        };
    }>;
    tags: Array<{
        id: number;
        name: string;
    }>;
}

interface Props {
    meeting: Meeting;
    participants: Array<{
        id: number;
        first_name: string;
        last_name: string;
    }>;
}

export default function ShowMeeting({ meeting, participants = [] }: Props) {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);

    // Define breadcrumbs with parent and current page
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Meetings',
            href: '/meetings',
        },
        {
            title: meeting.title,
            href: `/meetings/${meeting.id}`,
        },
    ];

    // Form for updating notes
    const {
        data: notesData,
        setData: setNotesData,
        put: updateNotes,
        processing: notesProcessing,
    } = useForm({
        notes: meeting.notes || '',
    });

    // Form for adding tasks
    const {
        data: taskData,
        setData: setTaskData,
        post: createTask,
        processing: taskProcessing,
        reset: resetTask,
    } = useForm({
        title: '',
        description: '',
        status: 'pending',
        assigned_to: '',
        meeting_id: meeting.id,
    });

    const handleSaveNotes = (e: React.FormEvent) => {
        e.preventDefault();
        updateNotes(route('meetings.update', meeting.id), {
            onSuccess: () => {
                setIsEditingNotes(false);
            },
        });
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        createTask(route('tasks.store'), {
            onSuccess: () => {
                resetTask();
                setIsAddingTask(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Meeting: ${meeting.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Meeting Header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-gray-900">{meeting.title}</h1>
                                {meeting.meeting_series && (
                                    <Badge variant="outline" className="mb-4">
                                        Series: {meeting.meeting_series.title}
                                    </Badge>
                                )}
                            </div>
                            <Button variant="outline" asChild>
                                <a href={route('meetings.edit', meeting.id)}>
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit Meeting
                                </a>
                            </Button>
                        </div>

                        {/* Meeting Info */}
                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-gray-500" />
                                <span>{formatDate(meeting.meeting_time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-5 w-5 text-gray-500" />
                                <span>{formatTime(meeting.meeting_time)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <UsersIcon className="h-5 w-5 text-gray-500" />
                                <span>
                                    {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Notes Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Meeting Notes</CardTitle>
                                    {!isEditingNotes && (
                                        <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(true)}>
                                            <EditIcon className="mr-2 h-4 w-4" />
                                            Edit Notes
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isEditingNotes ? (
                                    <form onSubmit={handleSaveNotes} className="space-y-4">
                                        <Textarea
                                            value={notesData.notes}
                                            onChange={(e) => setNotesData('notes', e.target.value)}
                                            rows={10}
                                            placeholder="Add your meeting notes here..."
                                            className="w-full"
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditingNotes(false);
                                                    setNotesData('notes', meeting.notes || '');
                                                }}
                                            >
                                                <XIcon className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={notesProcessing}>
                                                <SaveIcon className="mr-2 h-4 w-4" />
                                                {notesProcessing ? 'Saving...' : 'Save Notes'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="prose max-w-none">
                                        {meeting.notes ? (
                                            <p className="whitespace-pre-wrap">{meeting.notes}</p>
                                        ) : (
                                            <p className="text-gray-500 italic">No notes added yet. Click "Edit Notes" to add your meeting notes.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tasks Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Action Items & Tasks</CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setIsAddingTask(true)}>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add Task
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Add Task Form */}
                                {isAddingTask && (
                                    <Card className="mb-6 border-dashed">
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleAddTask} className="space-y-4">
                                                <div>
                                                    <Label htmlFor="title">Task Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={taskData.title}
                                                        onChange={(e) => setTaskData('title', e.target.value)}
                                                        placeholder="Enter task title..."
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="description">Description (Optional)</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={taskData.description}
                                                        onChange={(e) => setTaskData('description', e.target.value)}
                                                        placeholder="Task description..."
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="status">Status</Label>
                                                        <Select value={taskData.status} onValueChange={(value) => setTaskData('status', value)}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="assigned_to">Assign To</Label>
                                                        <Select
                                                            value={taskData.assigned_to}
                                                            onValueChange={(value) => setTaskData('assigned_to', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select person" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {participants.map((participant) => (
                                                                    <SelectItem key={participant.id} value={participant.id.toString()}>
                                                                        {participant.first_name} {participant.last_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsAddingTask(false);
                                                            resetTask();
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button type="submit" disabled={taskProcessing}>
                                                        {taskProcessing ? 'Adding...' : 'Add Task'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Tasks List */}
                                <div className="space-y-4">
                                    {meeting.tasks.length === 0 ? (
                                        <p className="py-8 text-center text-gray-500 italic">
                                            No tasks added yet. Click "Add Task" to create action items from this meeting.
                                        </p>
                                    ) : (
                                        meeting.tasks.map((task) => (
                                            <Card key={task.id} className="border-l-4 border-blue-500">
                                                <CardContent className="pt-4">
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <h4 className="font-semibold">{task.title}</h4>
                                                        <Badge className={getStatusColor(task.status)}>{task.status.replace('_', ' ')}</Badge>
                                                    </div>
                                                    {task.description && <p className="mb-2 text-sm text-gray-600">{task.description}</p>}
                                                    {task.assigned_to && (
                                                        <p className="text-sm text-gray-500">
                                                            Assigned to: {task.assigned_to.first_name} {task.assigned_to.last_name}
                                                        </p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Participants Section */}
                    {meeting.participants.length > 0 && (
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>Participants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {meeting.participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                                            <div className="flex-shrink-0">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                                                    {participant.first_name.charAt(0)}
                                                    {participant.last_name.charAt(0)}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {participant.first_name} {participant.last_name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tags Section */}
                    {meeting.tags.length > 0 && (
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {meeting.tags.map((tag) => (
                                        <Badge key={tag.id} variant="secondary">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

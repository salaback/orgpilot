import NotesSection from '@/components/notes-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, CheckIcon, ClockIcon, Edit2Icon, MapPinIcon, PlusIcon, StarIcon, TargetIcon, XIcon } from 'lucide-react';
import React from 'react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    title?: string;
    avatar?: string;
}

interface Task {
    id: number;
    description: string;
    assigned_to: number;
    assigned_to_user: User;
    due_date: string;
    status: string;
    created_by: User;
}

interface Goal {
    id: number;
    title: string;
    status: string;
    due_date: string;
    progress: number;
}

interface Initiative {
    id: number;
    title: string;
    status: string;
}

interface Note {
    id: number;
    title?: string;
    content: string;
    created_at: string;
    updated_at: string;
    notable_type?: string;
    notable_id?: number;
    tags?: Array<{ id: number; name: string }>;
}

interface Meeting {
    id: number;
    title: string;
    type: string;
    meeting_time: string;
    duration_minutes: number;
    status: 'scheduled' | 'completed' | 'cancelled';
    agenda: string;
    notes: Note[] | string;
    summary: string;
    location: string;
    created_by: User;
    tasks: Task[];
    goals: Goal[];
    initiatives: Initiative[];
    participants: User[];
}

interface DetailProps {
    meeting: Meeting;
    directReport?: User; // Only present for one-on-one meetings
}

const MeetingDetail: React.FC<DetailProps> = ({ meeting, directReport }) => {
    const isOneOnOne = meeting.type === 'one_on_one';

    // Define breadcrumbs based on meeting type
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Meetings',
            href: '/meetings',
        },
    ];

    // Add additional breadcrumbs for one-on-one meetings
    if (isOneOnOne && directReport) {
        breadcrumbs.unshift(
            {
                title: 'Organisation',
                href: '/organisation',
            },
            {
                title: directReport.full_name,
                href: `/organisation/profile/${directReport.id}`,
            },
            {
                title: '1:1 Meetings',
                href: `/meetings?type=one_on_one&direct_report_id=${directReport.id}`,
            },
        );
    } else {
        // For other meeting types, just add the type as a breadcrumb if it's not 'regular'
        if (meeting.type !== 'regular') {
            breadcrumbs.push({
                title: meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1).replace('_', ' ') + ' Meetings',
                href: `/meetings?type=${meeting.type}`,
            });
        }
    }

    // Add the current meeting to breadcrumbs
    breadcrumbs.push({
        title: meeting.title,
        href: `/meetings/${meeting.id}`,
    });

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP');
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'p');
        } catch {
            return '';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Badge className="bg-blue-500">Upcoming</Badge>;
            case 'completed':
                return <Badge className="bg-green-500">Completed</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-500">Cancelled</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    // Get the direct report for one-on-one meetings
    let directReportUser = directReport;
    if (isOneOnOne && !directReportUser) {
        // If directReport wasn't explicitly provided, find the participant who is not the creator
        directReportUser = meeting.participants.find((p) => p.id !== meeting.created_by.id);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={meeting.title} />

            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                {/* Header with meeting status and action buttons */}
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            {getStatusBadge(meeting.status)}
                            {isOneOnOne && <Badge variant="outline">1:1 Meeting</Badge>}
                            {meeting.type === 'steer_co' && <Badge variant="outline">Steering Committee</Badge>}
                            {meeting.type === 'standup' && <Badge variant="outline">Standup</Badge>}
                            {meeting.type === 'project' && <Badge variant="outline">Project</Badge>}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{meeting.title}</h1>
                        {isOneOnOne && directReportUser && (
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                with {directReportUser.full_name}
                                {directReportUser.title && ` (${directReportUser.title})`}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {meeting.status === 'scheduled' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={`/meetings/${meeting.id}/complete`}>
                                        <CheckIcon className="mr-2 h-4 w-4" />
                                        Complete
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={`/meetings/${meeting.id}/cancel`}>
                                        <XIcon className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Link>
                                </Button>
                            </>
                        )}
                        <Button asChild>
                            <Link href={`/meetings/${meeting.id}/edit`}>
                                <Edit2Icon className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Meeting Details Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Meeting Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Meeting Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="flex items-center">
                                        <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Date & Time</p>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {formatDate(meeting.meeting_time)} at {formatTime(meeting.meeting_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <ClockIcon className="mr-2 h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Duration</p>
                                            <p className="text-gray-700 dark:text-gray-300">{meeting.duration_minutes} minutes</p>
                                        </div>
                                    </div>
                                </div>

                                {meeting.location && (
                                    <div className="flex items-center">
                                        <MapPinIcon className="mr-2 h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-gray-700 dark:text-gray-300">{meeting.location}</p>
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {meeting.agenda && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-medium">Agenda</h3>
                                        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{meeting.agenda}</div>
                                    </div>
                                )}

                                {meeting.summary && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-medium">Meeting Summary</h3>
                                        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{meeting.summary}</div>
                                    </div>
                                )}

                                {typeof meeting.notes === 'string' && meeting.notes && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-medium">Notes</h3>
                                        <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{meeting.notes}</div>
                                    </div>
                                )}
                                {Array.isArray(meeting.notes) && <NotesSection notes={meeting.notes} entityType="meeting" entityId={meeting.id} />}
                            </CardContent>
                        </Card>

                        {/* Action Items / Tasks */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Action Items</CardTitle>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/meetings/${meeting.id}/tasks/create`}>
                                        <PlusIcon className="mr-2 h-4 w-4" />
                                        Add Action Item
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {meeting.tasks.length === 0 ? (
                                    <p className="py-6 text-center text-gray-500">No action items have been created yet.</p>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {meeting.tasks.map((task) => (
                                            <Tooltip key={task.id}>
                                                <TooltipTrigger asChild>
                                                    <div className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                                                        <input type="checkbox" checked={task.status === 'completed'} readOnly />
                                                        <span
                                                            className={`truncate ${task.status === 'completed' ? 'text-gray-400 line-through' : ''}`}
                                                        >
                                                            {task.description}
                                                        </span>
                                                        <span className="ml-auto text-xs text-gray-500">{task.assigned_to_user?.first_name}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="w-64">
                                                    <div className="mb-2">
                                                        <div className="font-semibold">{task.description}</div>
                                                        {task.due_date && (
                                                            <div className="text-xs text-gray-500">
                                                                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500">
                                                            Assigned to: {task.assigned_to_user?.first_name} {task.assigned_to_user?.last_name}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex gap-2">
                                                        <Button size="sm" variant="outline" asChild>
                                                            <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
                                                        </Button>
                                                        {task.status !== 'completed' && (
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href={`/tasks/${task.id}/complete`}>Complete</Link>
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="destructive" asChild>
                                                            <Link href={`/tasks/${task.id}/delete`}>Delete</Link>
                                                        </Button>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Participants */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Participants</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Meeting Creator (Manager for 1:1) */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={meeting.created_by.avatar} />
                                                <AvatarFallback>
                                                    {meeting.created_by.first_name?.[0]}
                                                    {meeting.created_by.last_name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">
                                                    {meeting.created_by.first_name} {meeting.created_by.last_name}
                                                </p>
                                                {isOneOnOne && <p className="text-sm text-gray-500">Manager</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* For 1:1 meetings, show the direct report */}
                                    {isOneOnOne && directReportUser && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={directReportUser.avatar} />
                                                    <AvatarFallback>
                                                        {directReportUser.first_name?.[0]}
                                                        {directReportUser.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {directReportUser.first_name} {directReportUser.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Direct Report</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Other participants (for non-1:1 or additional participants) */}
                                    {meeting.participants
                                        .filter((p) => p.id !== meeting.created_by.id)
                                        .filter((p) => !isOneOnOne || (directReportUser && p.id !== directReportUser.id))
                                        .map((participant) => (
                                            <div key={participant.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={participant.avatar} />
                                                        <AvatarFallback>
                                                            {participant.first_name?.[0]}
                                                            {participant.last_name?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">
                                                            {participant.first_name} {participant.last_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Goals */}
                        {meeting.goals && meeting.goals.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TargetIcon className="mr-2 h-5 w-5" />
                                        Related Goals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {meeting.goals.map((goal) => (
                                            <li key={goal.id}>
                                                <Link href={`/goals/${goal.id}`} className="hover:underline">
                                                    {goal.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Initiatives */}
                        {meeting.initiatives && meeting.initiatives.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <StarIcon className="mr-2 h-5 w-5" />
                                        Related Initiatives
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {meeting.initiatives.map((initiative) => (
                                            <li key={initiative.id}>
                                                <Link href={`/initiatives/${initiative.id}`} className="hover:underline">
                                                    {initiative.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default MeetingDetail;

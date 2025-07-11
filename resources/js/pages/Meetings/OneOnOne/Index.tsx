import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Employee, Meeting } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import React from 'react';

interface OneOnOneIndexProps {
    employee: Employee;
    meetings: Meeting[];
}

const Index: React.FC<OneOnOneIndexProps> = ({ employee, meetings }) => {
    // Define breadcrumbs for one-on-one meetings page
    const breadcrumbs = [
        {
            title: 'Organisation',
            href: '/organisation',
        },
        {
            title: employee.full_name,
            href: `/organisation/profile/${employee.id}`,
        },
        {
            title: '1:1 Meetings',
            href: `/meetings?type=one_on_one&direct_report_id=${employee.id}`,
        },
    ];

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'PPP p');
        } catch {
            return dateString;
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
        <Card key={meeting.id} className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>
                            <Link href={`/meetings/${meeting.id}`} className="hover:underline">
                                {meeting.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                            <CalendarIcon className="mr-1 h-4 w-4" />
                            {formatDate(meeting.meeting_time)}
                        </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(meeting.status)}>
                        {meeting.status === 'scheduled' ? 'Upcoming' : meeting.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {meeting.location && (
                    <div className="mb-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="mr-1 h-4 w-4" />
                        {meeting.location}
                    </div>
                )}
                {meeting.agenda && (
                    <div className="mt-2">
                        <h4 className="mb-1 text-sm font-medium">Agenda</h4>
                        <p className="line-clamp-3 text-sm whitespace-pre-line text-gray-700 dark:text-gray-300">{meeting.agenda}</p>
                    </div>
                )}
                {meeting.tasks && meeting.tasks.length > 0 && (
                    <div className="mt-3">
                        <h4 className="mb-1 text-sm font-medium">Action Items ({meeting.tasks.length})</h4>
                        <ul className="list-inside list-disc text-sm text-gray-700 dark:text-gray-300">
                            {meeting.tasks.slice(0, 3).map((task) => (
                                <li key={task.id} className="line-clamp-1">
                                    {task.description}
                                    {task.status === 'completed' && <span className="ml-1 text-green-500">(Completed)</span>}
                                    {task.due_date && (
                                        <span className="ml-1 text-gray-500">
                                            <ClockIcon className="mr-1 inline h-3 w-3" />
                                            {format(new Date(task.due_date), 'MMM d')}
                                        </span>
                                    )}
                                </li>
                            ))}
                            {meeting.tasks.length > 3 && <li className="text-gray-500 italic">+{meeting.tasks.length - 3} more action items...</li>}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`1:1 Meetings with ${employee.full_name}`} />

            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">1:1 Meetings with {employee.full_name}</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">{employee.title}</p>
                    </div>

                    <Button asChild>
                        <Link href={`/meetings/one-on-one/create?direct_report_id=${employee.id}`}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Schedule Meeting
                        </Link>
                    </Button>
                </div>

                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="upcoming">Upcoming Meetings ({meetings.length})</TabsTrigger>
                        <TabsTrigger value="past">Past Meetings ({meetings.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                        {meetings.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="mb-4 text-gray-600 dark:text-gray-400">No upcoming meetings scheduled.</p>
                                    <Button asChild>
                                        <Link href={`/meetings/one-on-one/create?direct_report_id=${employee.id}`}>
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Schedule a Meeting
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-4">
                        {meetings.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-gray-600 dark:text-gray-400">No past meetings found.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default Index;

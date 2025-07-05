import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UsersIcon, TagIcon, PlusIcon } from 'lucide-react';
import { CreateMeetingSheet } from '@/components/meetings/create-meeting-sheet';
import { CreateMeetingSeriesSheet } from '@/components/meetings/create-meeting-series-sheet';

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
        status: string;
    }>;
    tags: Array<{
        id: number;
        name: string;
    }>;
}

interface Props {
    meetings: Meeting[];
    meetingSeries: Array<{
        id: number;
        title: string;
    }>;
}

export default function MeetingsIndex({ meetings, meetingSeries }: Props) {
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [isCreateSeriesSheetOpen, setIsCreateSeriesSheetOpen] = useState(false);

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

    return (
        <AppLayout>
            <Head title="Meetings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Meetings
                            </h2>
                            <div className="flex gap-2">
                                <Button onClick={() => setIsCreateSeriesSheetOpen(true)}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    New Meeting Series
                                </Button>
                                <Button onClick={() => setIsCreateSheetOpen(true)}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    New Meeting
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex gap-4">
                            <Button variant="outline" asChild>
                                <Link href={route('meetings.index')}>
                                    All Meetings
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('meeting-series.index')}>
                                    Meeting Series
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {meetings.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
                                <p className="text-gray-600 mb-4">
                                    Create your first meeting to get started with team collaboration.
                                </p>
                                <Button onClick={() => setIsCreateSheetOpen(true)}>
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Create Meeting
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {meetings.map((meeting) => (
                                <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl mb-2">
                                                    <Link
                                                        href={route('meetings.show', meeting.id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors cursor-pointer"
                                                    >
                                                        {meeting.title}
                                                    </Link>
                                                </CardTitle>
                                                {meeting.meeting_series && (
                                                    <Badge variant="outline" className="mb-2">
                                                        Series: {meeting.meeting_series.title}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={route('meetings.show', meeting.id)}>
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={route('meetings.edit', meeting.id)}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {formatDate(meeting.meeting_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {formatTime(meeting.meeting_time)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <UsersIcon className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TagIcon className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {meeting.tasks.length} task{meeting.tasks.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {meeting.tags.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {meeting.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="secondary">
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {meeting.notes && (
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-600 line-clamp-3">
                                                    {meeting.notes}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateMeetingSheet
                isOpen={isCreateSheetOpen}
                onClose={() => setIsCreateSheetOpen(false)}
                meetingSeries={meetingSeries}
                onSuccess={() => {
                    window.location.reload();
                }}
            />

            <CreateMeetingSeriesSheet
                isOpen={isCreateSeriesSheetOpen}
                onClose={() => setIsCreateSeriesSheetOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </AppLayout>
    );
}

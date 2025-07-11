import { CreateMeetingSeriesSheet } from '@/components/meetings/create-meeting-series-sheet';
import { CreateMeetingSheet } from '@/components/meetings/create-meeting-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { getCookie } from '@/lib/cookies';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CalendarIcon, ClockIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// FullCalendar imports
import { DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

interface Meeting {
    id: number;
    title: string;
    meeting_time: string;
    status: string;
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

interface IndexProps {
    meetings: Meeting[];
    meetingSeries: Array<{
        id: number;
        title: string;
    }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meetings',
        href: '/meetings',
    },
];

export default function MeetingsIndex({ meetings: initialMeetings, meetingSeries }: IndexProps) {
    // State for tracking meetings locally (so we can add without refreshing)
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
    const [isCreateSeriesSheetOpen, setIsCreateSeriesSheetOpen] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState<string | undefined>(undefined);

    // Get view mode from cookie/localStorage (managed by the header)
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>(() => {
        if (typeof document !== 'undefined') {
            const cookieValue = getCookie('meetingViewMode');
            if (cookieValue === 'calendar' || cookieValue === 'list') {
                return cookieValue as 'calendar' | 'list';
            }
        }

        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('meetingViewMode');
            return savedMode === 'calendar' || savedMode === 'list' ? (savedMode as 'calendar' | 'list') : 'calendar';
        }

        return 'calendar'; // Default
    });

    // Reference to the calendar instance
    const calendarRef = useRef<FullCalendar | null>(null);

    // Listen for view mode changes from the header
    useEffect(() => {
        const handleViewModeChange = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail && customEvent.detail.viewMode) {
                setViewMode(customEvent.detail.viewMode);
            }
        };

        window.addEventListener('meetingViewModeChange', handleViewModeChange);

        // Check periodically for changes in localStorage/cookies
        const interval = setInterval(() => {
            const currentMode = getCookie('meetingViewMode') || localStorage.getItem('meetingViewMode');
            if (currentMode && (currentMode === 'calendar' || currentMode === 'list') && currentMode !== viewMode) {
                setViewMode(currentMode as 'calendar' | 'list');
            }
        }, 300);

        return () => {
            window.removeEventListener('meetingViewModeChange', handleViewModeChange);
            clearInterval(interval);
        };
    }, [viewMode]);

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

    // Function to transform a meeting into a calendar event
    const transformMeetingToCalendarEvent = (meeting: Meeting) => ({
        id: String(meeting.id),
        title: meeting.title,
        start: meeting.meeting_time,
        end: new Date(new Date(meeting.meeting_time).getTime() + 60 * 60 * 1000),
        extendedProps: {
            participants: meeting.participants,
            tags: meeting.tags,
            meeting_series: meeting.meeting_series,
        },
        url: route('meetings.show', meeting.id),
        backgroundColor: meeting.meeting_series ? '#4f46e5' : '#10b981',
    });

    // Transform meetings data for FullCalendar
    const calendarEvents = meetings.map(transformMeetingToCalendarEvent);

    // Event render function for custom styling
    const renderEventContent = (eventInfo: unknown) => {
        const info = eventInfo as unknown as {
            event: {
                title: string;
                extendedProps: {
                    participants: { id: number; first_name: string; last_name: string }[];
                    meeting_series?: { title: string };
                };
            };
        };
        return (
            <div className="fc-content">
                <div className="fc-title font-medium">{info.event.title}</div>
                <div className="fc-description mt-1 text-xs">
                    {info.event.extendedProps.participants.length > 0 && (
                        <span className="mr-2">
                            <UsersIcon className="mr-1 inline h-3 w-3" />
                            {info.event.extendedProps.participants.length}
                        </span>
                    )}
                    {info.event.extendedProps.meeting_series && (
                        <span className="text-xs">
                            <Badge variant="secondary" className="text-xs">
                                {info.event.extendedProps.meeting_series.title}
                            </Badge>
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Format date and time for datetime-local input
    const formatDateTimeForInput = (date: Date): string => {
        // Format YYYY-MM-DDTHH:MM (required format for datetime-local input)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Handle calendar date selection
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        // Get the selected start date
        const start = selectInfo.start;

        // Round minutes to nearest 30-minute interval for better UX
        const minutes = Math.round(start.getMinutes() / 30) * 30;
        start.setMinutes(minutes);

        // Format the date for the datetime-local input
        const formattedDateTime = formatDateTimeForInput(start);

        // Set the selected date time and open the create sheet
        setSelectedDateTime(formattedDateTime);
        setIsCreateSheetOpen(true);
    };

    // Handle successful meeting creation
    const handleMeetingCreated = (newMeeting: Meeting) => {
        // Add the meeting to our local state
        setMeetings((prevMeetings) => [...prevMeetings, newMeeting]);

        // If calendar view is active, refresh the calendar to show the new meeting
        if (viewMode === 'calendar' && calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();

            // Add the new event to the calendar
            calendarApi.addEvent(transformMeetingToCalendarEvent(newMeeting));

            // If we have a date selected, navigate to that date
            if (selectedDateTime) {
                const selectedDate = new Date(selectedDateTime);
                calendarApi.gotoDate(selectedDate);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meetings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl leading-tight font-semibold text-gray-800">Meetings</h2>
                            <div className="flex gap-2">
                                <Button onClick={() => setIsCreateSeriesSheetOpen(true)}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    New Meeting Series
                                </Button>
                                <Button onClick={() => setIsCreateSheetOpen(true)}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    New Meeting
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex gap-4">
                            <Button variant="outline" asChild>
                                <Link href={route('meetings.index')}>All Meetings</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={route('meeting-series.index')}>Meeting Series</Link>
                            </Button>
                        </div>
                    </div>

                    {viewMode === 'calendar' ? (
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="h-[800px]">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                    }}
                                    events={calendarEvents}
                                    eventContent={renderEventContent}
                                    height="100%"
                                    nowIndicator={true}
                                    navLinks={true}
                                    editable={false}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                    weekends={true}
                                    eventTimeFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        meridiem: 'short',
                                    }}
                                    select={handleDateSelect}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {meetings.map((meeting) => (
                                <Link href={route('meetings.show', meeting.id)} key={meeting.id}>
                                    <div className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
                                        <h3 className="mb-2 text-lg font-semibold">{meeting.title}</h3>

                                        <div className="mb-3 text-sm text-gray-600">
                                            <div className="mb-1 flex items-center">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formatDate(meeting.meeting_time)}
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="mr-2 h-4 w-4" />
                                                {formatTime(meeting.meeting_time)}
                                            </div>
                                        </div>

                                        {meeting.meeting_series && (
                                            <Badge variant="secondary" className="mb-3">
                                                {meeting.meeting_series.title}
                                            </Badge>
                                        )}

                                        <div className="mb-3 flex items-center gap-2">
                                            <UsersIcon className="h-4 w-4" />
                                            <span className="text-sm text-gray-600">{meeting.participants.length} participants</span>
                                        </div>

                                        {meeting.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {meeting.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="outline">
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateMeetingSheet
                isOpen={isCreateSheetOpen}
                onClose={() => {
                    setIsCreateSheetOpen(false);
                    setSelectedDateTime(undefined);
                }}
                meetingSeries={meetingSeries || []}
                initialDateTime={selectedDateTime}
                onSuccess={(newMeeting?: Meeting) => {
                    if (newMeeting) handleMeetingCreated(newMeeting);
                }}
            />

            <CreateMeetingSeriesSheet isOpen={isCreateSeriesSheetOpen} onClose={() => setIsCreateSeriesSheetOpen(false)} />
        </AppLayout>
    );
}

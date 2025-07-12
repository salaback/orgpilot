import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2Icon, ClockIcon, ListTodoIcon, MapPinIcon, PlusIcon, StarIcon, TargetIcon } from 'lucide-react';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
}

interface Meeting {
    id: number;
    meeting_time: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    agenda: string;
    location: string;
    created_by: User;
    participants: User[];
}

interface ActionItem {
    id: number;
    description: string;
    due_date: string;
    status: string;
    owner: User;
}

interface Goal {
    id: number;
    title: string;
    due_date: string;
    status: string;
    progress: number;
}

interface Initiative {
    id: number;
    title: string;
    status: string;
}

interface PageProps {
    meetings: Meeting[];
    actionItems: ActionItem[];
    goals: Goal[];
    initiatives: Initiative[];
    [key: string]: Meeting[] | ActionItem[] | Goal[] | Initiative[] | string | number | boolean;
}

// Placeholder data for demo purposes
// In production, this would come from the backend via Inertia props

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { meetings, actionItems, goals, initiatives } = usePage<PageProps>().props;
    const todayDate = new Date();
    const todaysDateFormatted = format(todayDate, 'MMMM d, yyyy');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full w-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Daily Overview - {todaysDateFormatted}</h1>
                </div>

                {/* Top Row - Today's Summary */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Today's Meetings */}
                    <Card className="col-span-2">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle>Today's Meetings</CardTitle>
                                <Link href="/meetings/create">
                                    <Button variant="outline" size="sm">
                                        <PlusIcon className="mr-1 h-4 w-4" /> Schedule
                                    </Button>
                                </Link>
                            </div>
                            <CardDescription>Your scheduled one-on-ones for today</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-0">
                            {meetings && meetings.length > 0 ? (
                                <div className="space-y-3">
                                    {meetings.map((meeting) => (
                                        <div key={meeting.id} className="rounded-lg border p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{format(new Date(meeting.meeting_time), 'h:mm a')}</span>
                                                </div>
                                                <Badge variant={meeting.status === 'scheduled' ? 'outline' : 'secondary'}>
                                                    {meeting.status === 'scheduled' ? 'Upcoming' : meeting.status}
                                                </Badge>
                                            </div>

                                            <Link href={`/meetings/${meeting.id}`} className="font-medium hover:underline">
                                                {meeting.agenda || 'No agenda set'}
                                            </Link>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <MapPinIcon className="mr-1 h-3.5 w-3.5" />
                                                        <span>{meeting.location || 'No location set'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <span className="mr-2 text-sm">with</span>
                                                    {meeting.participants && meeting.participants.length > 0 ? (
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={meeting.participants[0].avatar || undefined} />
                                                            <AvatarFallback>
                                                                {meeting.participants[0].first_name.charAt(0)}
                                                                {meeting.participants[0].last_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No participants</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CalendarIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">No meetings scheduled for today</p>
                                    <Link href="/meetings/create" className="mt-2">
                                        <Button variant="outline" size="sm">
                                            Schedule a meeting
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-1">
                            <Link href="/meetings" className="text-sm text-muted-foreground hover:underline">
                                View all meetings
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Action Items */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Action Items</CardTitle>
                                <Badge variant="outline">{actionItems ? actionItems.length : 0}</Badge>
                            </div>
                            <CardDescription>Items that need your attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {actionItems && actionItems.length > 0 ? (
                                <div className="space-y-2">
                                    {actionItems.map((item) => (
                                        <div key={item.id} className="flex items-start justify-between border-b py-2 last:border-0">
                                            <div className="flex items-start gap-2">
                                                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                                                    <CheckCircle2Icon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{item.description}</p>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <ClockIcon className="mr-1 h-3 w-3" />
                                                        Due {format(new Date(item.due_date), 'MMM d')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <ListTodoIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">No action items due soon</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link href="/action-items">
                                <Button variant="outline" size="sm">
                                    View all
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                {/* Bottom Row - Goals & Initiatives */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Goals */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Goals</CardTitle>
                                <Link href="/goals/create">
                                    <Button variant="outline" size="sm">
                                        <PlusIcon className="mr-1 h-4 w-4" /> Add
                                    </Button>
                                </Link>
                            </div>
                            <CardDescription>Your active goals and progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {goals && goals.length > 0 ? (
                                <div className="space-y-4">
                                    {goals.map((goal) => (
                                        <div key={goal.id} className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <TargetIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <Link href={`/goals/${goal.id}`} className="text-sm font-medium hover:underline">
                                                        {goal.title}
                                                    </Link>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                                            </div>
                                            <Progress value={goal.progress} className="h-1.5" />
                                            <p className="text-xs text-muted-foreground">Due {format(new Date(goal.due_date), 'MMM d, yyyy')}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <TargetIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">No active goals</p>
                                    <Link href="/goals/create" className="mt-2">
                                        <Button variant="outline" size="sm">
                                            Create a goal
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Initiatives */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Initiatives</CardTitle>
                                <Link href="/initiatives">
                                    <Button variant="outline" size="sm">
                                        View all
                                    </Button>
                                </Link>
                            </div>
                            <CardDescription>Strategic initiatives you're involved in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {initiatives && initiatives.length > 0 ? (
                                <div className="space-y-2">
                                    {initiatives.map((initiative) => (
                                        <div key={initiative.id} className="flex items-center justify-between border-b py-2 last:border-0">
                                            <div className="flex items-center">
                                                <StarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <Link href={`/initiatives/${initiative.id}`} className="text-sm font-medium hover:underline">
                                                    {initiative.title}
                                                </Link>
                                            </div>
                                            <Badge variant="outline">
                                                {initiative.status === 'in_progress'
                                                    ? 'In Progress'
                                                    : initiative.status === 'planning'
                                                      ? 'Planning'
                                                      : initiative.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <StarIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">No initiatives yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

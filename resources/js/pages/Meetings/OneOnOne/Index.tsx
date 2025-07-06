import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Task {
  id: number;
  description: string;
  assigned_to: number;
  assigned_to_user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  due_date: string;
  status: string;
}

interface Meeting {
  id: number;
  title: string;
  type: string;
  meeting_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string;
  summary: string;
  location: string;
  tasks: Task[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  title: string;
}

interface IndexProps {
  directReport: User;
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
}

const Index: React.FC<IndexProps> = ({ directReport, upcomingMeetings, pastMeetings }) => {
  // Define breadcrumbs for one-on-one meetings page
  const breadcrumbs: BreadcrumbItem[] = [
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
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <Card key={meeting.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              <Link href={`/meetings/${meeting.id}`} className="hover:underline">
                {meeting.title}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <CalendarIcon className="h-4 w-4 mr-1" />
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
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <MapPinIcon className="h-4 w-4 mr-1" />
            {meeting.location}
          </div>
        )}
        {meeting.agenda && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Agenda</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-3">
              {meeting.agenda}
            </p>
          </div>
        )}
        {meeting.tasks && meeting.tasks.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-1">Action Items ({meeting.tasks.length})</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              {meeting.tasks.slice(0, 3).map((task) => (
                <li key={task.id} className="line-clamp-1">
                  {task.description}
                  {task.status === 'completed' && <span className="text-green-500 ml-1">(Completed)</span>}
                  {task.due_date && (
                    <span className="text-gray-500 ml-1">
                      <ClockIcon className="inline h-3 w-3 mr-1" />
                      {format(new Date(task.due_date), 'MMM d')}
                    </span>
                  )}
                </li>
              ))}
              {meeting.tasks.length > 3 && (
                <li className="text-gray-500 italic">
                  +{meeting.tasks.length - 3} more action items...
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`1:1 Meetings with ${directReport.full_name}`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              1:1 Meetings with {directReport.full_name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{directReport.title}</p>
          </div>

          <Button asChild>
            <Link href={`/meetings/one-on-one/create?direct_report_id=${directReport.id}`}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming Meetings ({upcomingMeetings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Meetings ({pastMeetings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingMeetings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No upcoming meetings scheduled.</p>
                  <Button asChild>
                    <Link href={`/meetings/one-on-one/create?direct_report_id=${directReport.id}`}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Schedule a Meeting
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastMeetings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No past meetings found.</p>
                </CardContent>
              </Card>
            ) : (
              pastMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Index;

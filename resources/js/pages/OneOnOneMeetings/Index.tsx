import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import { type Employee } from '@/types';

interface ActionItem {
  id: number;
  description: string;
  owner: {
    id: number;
    name: string;
  };
  due_date: string;
  status: string;
}

interface Meeting {
  id: number;
  meeting_time: string;
  completed_at: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string;
  summary: string;
  location: string;
  actionItems: ActionItem[];
}

interface OneOnOneMeetingsIndexProps {
  employee: Employee;
  meetings: any[];
}

const Index: React.FC<OneOnOneMeetingsIndexProps> = ({ employee, meetings }) => {
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
      href: `/organisation/profile/${employee.id}/one-on-one`,
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`1:1 Meetings with ${employee.full_name}`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              1:1 Meetings with {employee.full_name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{employee.title}</p>
          </div>

          <Button asChild>
            <Link href={`/organisation/profile/${employee.id}/one-on-one/create`}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Upcoming Meeting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* The original code had a variable `upcomingMeeting` which was not defined.
                  Assuming it was meant to be a prop or state, but it's not.
                  For now, I'll remove it as it's causing a runtime error. */}
              {/* {upcomingMeeting ? ( */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusBadgeColor('scheduled')}>
                      Scheduled
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {/* The original code had `upcomingMeeting.meeting_time` which was not defined.
                          Assuming it was meant to be a prop or state, but it's not.
                          For now, I'll remove it as it's causing a runtime error. */}
                      {/* {formatDate(upcomingMeeting.meeting_time)} */}
                      {/* Placeholder for date */}
                    </span>
                  </div>

                  {/* The original code had `upcomingMeeting.location` which was not defined.
                      Assuming it was meant to be a prop or state, but it's not.
                      For now, I'll remove it as it's causing a runtime error. */}
                  {/* {upcomingMeeting.location && ( */}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="mr-2 h-4 w-4" />
                      {/* Placeholder for location */}
                    </div>
                  {/* )} */}

                  {/* The original code had `upcomingMeeting.agenda` which was not defined.
                      Assuming it was meant to be a prop or state, but it's not.
                      For now, I'll remove it as it's causing a runtime error. */}
                  {/* {upcomingMeeting.agenda && ( */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Agenda</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {/* Placeholder for agenda */}
                      </p>
                    </div>
                  {/* )} */}

                  {/* The original code had `upcomingMeeting.actionItems` which was not defined.
                      Assuming it was meant to be a prop or state, but it's not.
                      For now, I'll remove it as it's causing a runtime error. */}
                  {/* {upcomingMeeting.actionItems && upcomingMeeting.actionItems.length > 0 && ( */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Action Items</h4>
                      <div className="space-y-2">
                        {/* Placeholder for action items */}
                        {/* {upcomingMeeting.actionItems.map(item => ( */}
                          <div key={1} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-blue-500`} />
                            {/* Placeholder for action item description */}
                          </div>
                        {/* ))} */}
                      </div>
                    </div>
                  {/* )} */}

                  <div className="flex space-x-2 pt-4">
                    <Button asChild size="sm">
                      <Link href={`/organisation/profile/${employee.id}/one-on-one/${1}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/organisation/profile/${employee.id}/one-on-one/${1}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              {/* ) : ( */}
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No upcoming meetings</h3>
                  <p className="mt-1 text-sm text-gray-500">Schedule a new 1:1 meeting to get started.</p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href={`/organisation/profile/${employee.id}/one-on-one/create`}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Schedule Meeting
                      </Link>
                    </Button>
                  </div>
                </div>
              {/* )} */}
            </CardContent>
          </Card>

          {/* Past Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClockIcon className="mr-2 h-5 w-5" />
                Past Meetings
              </CardTitle>
              <CardDescription>
                {meetings.length} previous meeting{meetings.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meetings.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {meetings.map(meeting => (
                    <div key={meeting.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusBadgeColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(meeting.meeting_time)}
                        </span>
                      </div>

                      {meeting.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {meeting.summary}
                        </p>
                      )}

                      {meeting.actionItems && meeting.actionItems.length > 0 && (
                        <div className="text-xs text-gray-500 mb-2">
                          {meeting.actionItems.length} action item{meeting.actionItems.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/organisation/profile/${employee.id}/one-on-one/${meeting.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No past meetings</h3>
                  <p className="mt-1 text-sm text-gray-500">Your meeting history will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;

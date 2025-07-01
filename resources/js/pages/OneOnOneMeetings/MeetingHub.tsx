import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CalendarIcon, ChevronRightIcon, ClockIcon, MapPinIcon, CheckIcon, XIcon } from 'lucide-react';

interface ActionItem {
  id: number;
  description: string;
  owner: {
    id: number;
    name: string;
  };
  due_date: string;
  completed: boolean;
}

interface Meeting {
  id: number;
  scheduled_at: string;
  completed_at: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string;
  summary: string;
  location: string;
  action_items: ActionItem[];
}

interface MeetingHubProps {
  orgNode: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    title: string;
    photo_url?: string;
  };
  upcomingMeeting: Meeting | null;
  pastMeetings: {
    data: Meeting[];
    links: any;
  };
}

const MeetingHub: React.FC<MeetingHubProps> = ({ orgNode, upcomingMeeting, pastMeetings }) => {
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);

  // Check if we're within X minutes of a scheduled meeting
  const isWithinStartWindow = (scheduledTime: string) => {
    const meetingTime = new Date(scheduledTime).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutes in milliseconds
    return meetingTime - currentTime <= thirtyMinutesInMs && currentTime <= meetingTime;
  };

  return (
    <AppLayout>
      <Head title={`1:1 Meetings with ${orgNode.first_name}`} />

      <div className="container py-8 px-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">1:1 Meetings with {orgNode.first_name} {orgNode.last_name}</h1>
          <Link href={`/organisation/profile/${orgNode.id}/one-on-one/create`}>
            <Button>+ New Meeting</Button>
          </Link>
        </div>

        {/* Profile Summary */}
        <Card className="mb-10">
          <CardContent className="py-6 px-6">
            <div className="flex items-center gap-6">
              {orgNode.photo_url ? (
                <img src={orgNode.photo_url} alt={`${orgNode.first_name} ${orgNode.last_name}`} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
                  {orgNode.first_name.charAt(0)}{orgNode.last_name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{orgNode.first_name} {orgNode.last_name}</h2>
                <p className="text-gray-600">{orgNode.title}</p>
                <p className="text-gray-500 text-sm mt-1">{orgNode.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Meeting Card */}
        {upcomingMeeting ? (
          <Card className="mb-10 border-l-4 border-l-blue-500 shadow-md">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle>Upcoming 1:1 Meeting</CardTitle>
              <CardDescription className="mt-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>{format(new Date(upcomingMeeting.scheduled_at), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span>{format(new Date(upcomingMeeting.scheduled_at), 'h:mm a')}</span>
                </div>
                {upcomingMeeting.location && (
                  <div className="flex items-center gap-2 mt-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500" />
                    <span>{upcomingMeeting.location}</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6">
              <h3 className="font-medium mb-3">Agenda</h3>
              {upcomingMeeting.agenda ? (
                <div className="whitespace-pre-wrap text-gray-700">
                  {upcomingMeeting.agenda}
                </div>
              ) : (
                <p className="text-gray-500 italic">No agenda set</p>
              )}

              {upcomingMeeting.action_items && upcomingMeeting.action_items.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-3">Action Items</h3>
                  <ul className="space-y-3">
                    {upcomingMeeting.action_items.map(item => (
                      <li key={item.id} className="flex items-start gap-3">
                        <div className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full border ${item.completed ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'}`}>
                          {item.completed && <CheckIcon className="h-4 w-4 text-green-500" />}
                        </div>
                        <div>
                          <p className={item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                            {item.description}
                          </p>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>Owner: {item.owner.name}</span>
                            {item.due_date && <span>Due: {format(new Date(item.due_date), 'MMM d')}</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between px-6 pb-6">
              <div>
                <Link href={`/organisation/profile/${orgNode.id}/one-on-one/${upcomingMeeting.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Link href={`/organisation/profile/${orgNode.id}/one-on-one/${upcomingMeeting.id}`} className="ml-2">
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </div>
              {isWithinStartWindow(upcomingMeeting.scheduled_at) && (
                <Button
                  onClick={() => setIsStartingMeeting(true)}
                  disabled={isStartingMeeting}
                >
                  {isStartingMeeting ? 'Starting...' : 'Start Meeting'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <Card className="mb-10 bg-gray-50">
            <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No upcoming meetings scheduled</p>
              <Link href={`/organisation/profile/${orgNode.id}/one-on-one/create`}>
                <Button>Schedule a Meeting</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Past Meetings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Past Meetings</h2>
          {pastMeetings.data && pastMeetings.data.length > 0 ? (
            <div className="space-y-4">
              {pastMeetings.data.map(meeting => (
                <Link key={meeting.id} href={`/organisation/profile/${orgNode.id}/one-on-one/${meeting.id}`}>
                  <Card className="hover:bg-gray-50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{format(new Date(meeting.scheduled_at), 'MMMM d, yyyy')}</span>
                            <Badge variant={meeting.status === 'completed' ? 'success' : 'destructive'}>
                              {meeting.status === 'completed' ? 'Completed' : 'Cancelled'}
                            </Badge>
                          </div>
                          {meeting.summary && (
                            <p className="text-gray-700 line-clamp-2">{meeting.summary}</p>
                          )}
                          {meeting.action_items && meeting.action_items.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">{meeting.action_items.length} action item(s)</span>
                            </div>
                          )}
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="pt-6 text-center py-12">
                <p className="text-gray-500">No past meetings found</p>
              </CardContent>
            </Card>
          )}

          {/* Pagination if provided */}
          {pastMeetings.links && pastMeetings.links.length > 3 && (
            <div className="mt-4 flex justify-center">
              {/* Pagination component would go here */}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default MeetingHub;

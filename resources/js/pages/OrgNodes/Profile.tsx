import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarClock } from 'lucide-react';
import NotesSection from '@/components/notes-section';
import AppLayout from '@/layouts/app-layout';

interface ProfileProps {
  orgNode: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    title: string;
    email: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
    tags: Array<{id: number, name: string}>;
    manager: {
      id: number;
      full_name: string;
      title: string;
    } | null;
    directReports: Array<{
      id: number;
      full_name: string;
      title: string;
    }>;
    tasks: Array<{
      id: number;
      title: string;
      status: string;
      due_date: string;
    }>;
    initiatives: Array<{
      id: number;
      title: string;
      status: string;
    }>;
  };
  notes: Array<{
    id: number;
    title: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    tags: Array<{id: number, name: string}>;
  }>;
}

const Profile: React.FC<ProfileProps> = ({ orgNode, notes }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    open: 'bg-blue-500',
    former: 'bg-gray-500',
  };

  return (
    <AppLayout>
      <Head title={`${orgNode.full_name} - Profile`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{orgNode.full_name}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{orgNode.title}</p>
          </div>

          {/* 1:1 Meetings Button - Force full page reload */}
          <Button asChild>
            <a
              href={`/organisation/profile/${orgNode.id}/one-on-one`}
              className="flex items-center"
              target="_self"
              onClick={(e) => {
                // Force a full page reload
                window.location.href = `/organisation/profile/${orgNode.id}/one-on-one`;
                e.preventDefault();
              }}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              1:1 Meetings
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <Card className="p-6 col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                <div className="mt-1 flex items-center">
                  <span className={`inline-block h-3 w-3 rounded-full ${statusColors[orgNode.status] || 'bg-gray-500'} mr-2`}></span>
                  <span className="capitalize">{orgNode.status}</span>
                </div>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                <a href={`mailto:${orgNode.email}`} className="mt-1 block text-blue-600 hover:underline">
                  {orgNode.email || 'No email available'}
                </a>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</span>
                <span className="mt-1 block">{formatDate(orgNode.start_date)}</span>
              </div>

              {orgNode.status === 'former' && (
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">End Date</span>
                  <span className="mt-1 block">{formatDate(orgNode.end_date)}</span>
                </div>
              )}

              {orgNode.tags && orgNode.tags.length > 0 && (
                <div>
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {orgNode.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Reporting Structure Card */}
          <Card className="p-6 col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Reporting Structure</h2>

            <div className="space-y-6">
              {/* Manager */}
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Reports To</span>
                {orgNode.manager ? (
                  <a
                    href={`/organisation/profile/${orgNode.manager.id}`}
                    className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <p className="font-medium text-blue-600 hover:underline">{orgNode.manager.full_name}</p>
                    <p className="text-sm text-gray-500">{orgNode.manager.title}</p>
                  </a>
                ) : (
                  <p className="text-sm italic text-gray-500">No manager assigned</p>
                )}
              </div>

              {/* Direct Reports */}
              <div>
                <span className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Direct Reports ({orgNode.directReports?.length || 0})
                </span>

                {orgNode.directReports && orgNode.directReports.length > 0 ? (
                  <div className="space-y-2">
                    {orgNode.directReports.map(report => (
                      <a
                        key={report.id}
                        href={`/organisation/profile/${report.id}`}
                        className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <p className="font-medium text-blue-600 hover:underline">{report.full_name}</p>
                        <p className="text-sm text-gray-500">{report.title}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">No direct reports</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tasks & Initiatives Card */}
          <Card className="p-6 col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Tasks & Initiatives</h2>

            <div className="space-y-6">
              {/* Recent Tasks */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Recent Tasks</span>
                  <a href={route('organisation.profile.tasks', orgNode.id)} className="text-xs text-blue-600 hover:underline">View All</a>
                </div>

                {orgNode.tasks && orgNode.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {orgNode.tasks.map(task => (
                      <a
                        key={task.id}
                        href={`/tasks/${task.id}`}
                        className="block p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <p className="font-medium text-blue-600 hover:underline">{task.title}</p>
                        <div className="flex justify-between text-xs">
                          <span className="capitalize">{task.status}</span>
                          <span>Due: {formatDate(task.due_date)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">No tasks assigned</p>
                )}
              </div>

              {/* Recent Initiatives */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Recent Initiatives</span>
                  <a href={route('organisation.profile.initiatives', orgNode.id)} className="text-xs text-blue-600 hover:underline">View All</a>
                </div>

                {orgNode.initiatives && orgNode.initiatives.length > 0 ? (
                  <div className="space-y-2">
                    {orgNode.initiatives.map(initiative => (
                      <a
                        key={initiative.id}
                        href={`/initiatives/${initiative.id}`}
                        className="block p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <p className="font-medium text-blue-600 hover:underline">{initiative.title}</p>
                        <div className="flex text-xs">
                          <span className="capitalize">{initiative.status}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500">No initiatives assigned</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Notes Section */}
        <div className="mt-6 w-full">
          <NotesSection
            notes={notes}
            entityType="OrgNode"
            entityId={orgNode.id}
            orgNodes={[]}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;

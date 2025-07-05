import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  User,
  Tag as TagIcon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import NotesSection from '@/components/notes-section';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  percentage_complete: number;
  created_at: string;
  updated_at: string;
  assignedTo?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  initiative?: {
    id: number;
    title: string;
  };
  createdBy?: {
    id: number;
    name: string;
  };
  tags: Array<{ id: number; name: string }>;
}

interface ShowProps {
  task: Task;
  notes: Array<{
    id: number;
    title: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    tags: Array<{ id: number; name: string }>;
  }>;
  orgNodes: Array<{
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
  }>;
}

const Show: React.FC<ShowProps> = ({ task, notes, orgNodes }) => {
  // Define breadcrumbs with parent and current page
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Tasks',
      href: '/tasks',
    },
    {
      title: task.title,
      href: `/tasks/${task.id}`,
    },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Status color mapping
  const statusColors: Record<string, string> = {
    not_started: 'bg-gray-200 text-gray-800',
    in_progress: 'bg-blue-200 text-blue-800',
    completed: 'bg-green-200 text-green-800',
    on_hold: 'bg-yellow-200 text-yellow-800',
    cancelled: 'bg-red-200 text-red-800',
  };

  // Priority color mapping
  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  // Format status and priority for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  // Handle quick progress updates
  const updateProgress = (newProgress: number) => {
    router.patch(route('tasks.update-progress', task.id), {
      percentage_complete: newProgress
    }, { preserveState: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Task: ${task.title}`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Link
                href={route('tasks.index')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{task.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusColors[task.status]}>{formatStatus(task.status)}</Badge>
              <Badge className={priorityColors[task.priority]}>{formatPriority(task.priority)}</Badge>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={route('tasks.edit', task.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Description</h2>
                <div className="prose dark:prose-invert max-w-none">
                  {task.description ? (
                    <p className="whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Progress</h2>
                <div className="mb-4">
                  <Progress value={task.percentage_complete} className="h-4" />
                  <p className="mt-2 text-right text-sm text-gray-500">{task.percentage_complete}% complete</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => updateProgress(0)}>0%</Button>
                  <Button size="sm" variant="outline" onClick={() => updateProgress(25)}>25%</Button>
                  <Button size="sm" variant="outline" onClick={() => updateProgress(50)}>50%</Button>
                  <Button size="sm" variant="outline" onClick={() => updateProgress(75)}>75%</Button>
                  <Button size="sm" variant="outline" onClick={() => updateProgress(100)}>100%</Button>
                </div>
              </div>
            </Card>

            <NotesSection
              notes={notes}
              entityType="Task"
              entityId={task.id}
              orgNodes={orgNodes}
            />
          </div>

          <div className="lg:col-span-1">
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Details</h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</p>
                      {task.assignedTo ? (
                        <Link
                          href={route('organisation.profile', task.assignedTo.id)}
                          className="text-blue-600 hover:underline"
                        >
                          {task.assignedTo.full_name || `${task.assignedTo.first_name} ${task.assignedTo.last_name}`}
                        </Link>
                      ) : (
                        <p className="italic text-gray-500">Unassigned</p>
                      )}
                    </div>
                  </div>

                  {task.initiative && (
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Initiative</p>
                        <Link
                          href={route('initiative.show', task.initiative.id)}
                          className="text-blue-600 hover:underline"
                        >
                          {task.initiative.title}
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
                      <p>{formatDate(task.due_date)}</p>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-start">
                      <TagIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {task.tags.map(tag => (
                            <Badge key={tag.id} variant="secondary">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
                      <p className="text-sm">{formatDateTime(task.created_at)}</p>
                      {task.created_at !== task.updated_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {formatDateTime(task.updated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Show;

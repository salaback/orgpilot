import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import OneOnOneForm from '../OneOnOneForm';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  title?: string;
}

interface Meeting {
  id: number;
  title: string;
  meeting_time: string;
  duration_minutes: number;
  type: string;
  location: string;
  agenda: string;
  notes: string;
  summary: string;
  tasks: any[];
  goals: any[];
  initiatives: any[];
}

interface Goal {
  id: number;
  title: string;
  status: string;
  due_date: string;
}

interface Initiative {
  id: number;
  title: string;
  status: string;
  description: string;
}

interface EditProps {
  meeting: Meeting;
  directReport: User;
  goals: Goal[];
  initiatives: Initiative[];
  incompleteTasks: any[];
  availableUsers: User[];
}

const Edit: React.FC<EditProps> = ({
  meeting,
  directReport,
  goals,
  initiatives,
  incompleteTasks = [],
  availableUsers
}) => {
  // Define breadcrumbs
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
    {
      title: 'Edit Meeting',
      href: `/meetings/${meeting.id}/edit`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit 1:1 Meeting with ${directReport.full_name}`} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button asChild variant="ghost" size="sm" className="mr-4">
              <a href={`/meetings/${meeting.id}`}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Meeting
              </a>
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Edit 1:1 Meeting
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            with {directReport.full_name} {directReport.title ? `(${directReport.title})` : ''}
          </p>
        </div>

        <OneOnOneForm
          meeting={meeting}
          directReport={directReport}
          incompleteTasks={incompleteTasks}
          availableUsers={availableUsers}
          availableGoals={goals}
          availableInitiatives={initiatives}
          isEditing={true}
        />
      </div>
    </AppLayout>
  );
};

export default Edit;

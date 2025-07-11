import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import React from 'react';
import OneOnOneForm from '../OneOnOneForm';
import { Task } from '@/types';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    title?: string;
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

interface CreateProps {
    directReport: User;
    goals: Goal[];
    initiatives: Initiative[];
    incompleteTasks: Task[];
    availableUsers: User[];
}

const Create: React.FC<CreateProps> = ({ directReport, goals, initiatives, incompleteTasks = [], availableUsers }) => {
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
            title: 'Create',
            href: `/meetings/one-on-one/create?direct_report_id=${directReport.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Schedule 1:1 Meeting with ${directReport.full_name}`} />

            <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="mb-4 flex items-center">
                        <Button asChild variant="ghost" size="sm" className="mr-4">
                            <a href={`/meetings?type=one_on_one&direct_report_id=${directReport.id}`}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Meetings
                            </a>
                        </Button>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Schedule 1:1 Meeting</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        with {directReport.full_name} {directReport.title ? `(${directReport.title})` : ''}
                    </p>
                </div>

                <OneOnOneForm
                    directReport={directReport}
                    incompleteTasks={incompleteTasks}
                    availableUsers={availableUsers}
                    availableGoals={goals}
                    availableInitiatives={initiatives}
                    isEditing={false}
                />
            </div>
        </AppLayout>
    );
};

export default Create;

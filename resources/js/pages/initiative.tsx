import React from 'react';
import { PageProps } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';
import InitiativeDetailsPage from '../features/initiatives/initiative-details-page';
import { type BreadcrumbItem } from '@/types';

interface Initiative {
  id: number;
  title: string;
  description?: string;
  status: string;
  tags: Array<{id: number, name: string}>;
  due_date?: string;
  dueDate?: string;
  assignees?: number[];
  teamLabel?: string;
  allocations?: unknown[];
  order?: number;
  created_at: string;
  updated_at: string;
}

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
}

interface Note {
  id: number;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface InitiativePageProps extends PageProps {
  initiative: Initiative;
  assignees: OrgNode[];
  notes?: Note[];
  activeTab?: string; // Add activeTab prop
}

const Initiative: React.FC<InitiativePageProps> = ({ initiative, assignees, notes, activeTab = 'overview' }) => {
  // Define breadcrumbs with parent and current page
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Initiatives',
      href: '/initiatives',
    },
    {
      title: initiative.title,
      href: `/initiatives/${initiative.id}`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <InitiativeDetailsPage
        initiative={initiative}
        assignees={assignees}
        notes={notes}
        activeTab={activeTab}
      />
    </AppLayout>
  );
};

export default Initiative;

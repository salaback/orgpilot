import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { PageProps } from '@inertiajs/inertia';
import React from 'react';
import InitiativesPage from '../../features/initiatives/initiatives-page';

interface Initiative {
    id: number;
    title: string;
    description?: string;
    status: string;
    tags: string[];
    due_date?: string;
    assignees?: number[];
    teamLabel?: string;
    allocations?: unknown[];
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    title: string;
}

interface InitiativesPageProps extends PageProps {
    initiatives: Initiative[];
    assignees: Employee[];
    default_org_structure_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Initiatives',
        href: '/initiatives',
    },
];

const Initiatives: React.FC<InitiativesPageProps> = ({ initiatives, assignees, default_org_structure_id }) => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <InitiativesPage initiatives={initiatives} assignees={assignees} defaultOrgStructureId={default_org_structure_id} />
        </AppLayout>
    );
};

export default Initiatives;

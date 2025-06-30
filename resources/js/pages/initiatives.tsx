import React from 'react';
import { PageProps } from '@inertiajs/inertia';
import AppLayout from '@/layouts/app-layout';
import InitiativesPage from '../features/initiatives/InitiativesPage';

interface Initiative {
  id: number;
  title: string;
  description?: string;
  status: string;
  tags: string[];
  due_date?: string;
  assignees?: number[];
  teamLabel?: string;
  allocations?: any[];
}

interface OrgNode {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
}

interface InitiativesPageProps extends PageProps {
  initiatives: Initiative[];
  assignees: OrgNode[];
  default_org_structure_id: number | null;
}

const Initiatives: React.FC<InitiativesPageProps> = ({ initiatives, assignees, default_org_structure_id }) => {
  return (
    <AppLayout title="Initiatives">
      <InitiativesPage initiatives={initiatives} assignees={assignees} defaultOrgStructureId={default_org_structure_id} />
    </AppLayout>
  );
};

export default Initiatives;

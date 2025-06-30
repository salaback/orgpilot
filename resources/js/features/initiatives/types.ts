export type InitiativeStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed';

export interface InitiativeAllocation {
  userId: number;
  percent: number;
}

export interface Initiative {
  id: number;
  title: string;
  description: string;
  status: InitiativeStatus;
  tags: string[];
  dueDate?: string;
  assignees: number[];
  teamLabel?: string;
  allocations?: InitiativeAllocation[];
}

// Helper to ensure Initiative always has assignees as an array
export function defaultAssignees(initiative: Partial<Initiative>): Initiative {
  return {
    assignees: [],
    tags: [],
    ...initiative,
    assignees: initiative.assignees ?? [],
    tags: initiative.tags ?? [],
  } as Initiative;
}

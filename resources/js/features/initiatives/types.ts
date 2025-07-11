export type InitiativeStatus = 'planned' | 'in-progress' | 'complete' | 'on-hold' | 'cancelled';

export interface InitiativeAllocation {
    userId: number;
    percent: number;
}

export interface Tag {
    id: number;
    name: string;
}

export interface Initiative {
    id: number;
    title: string;
    description: string;
    status: InitiativeStatus;
    tags: (string | Tag)[]; // Support both old format (strings) and new format (objects)
    dueDate?: string;
    assignees: number[];
    teamLabel?: string;
    allocations?: InitiativeAllocation[];
    order?: number; // Add order field that we added to the database
}

// Helper to ensure Initiative always has assignees as an array
export function defaultAssignees(initiative: Partial<Initiative>): Initiative {
    return {
        ...initiative,
        assignees: initiative.assignees ?? [],
        tags: initiative.tags ?? [],
    } as Initiative;
}

import { Initiative } from './types';

export const mockUsers = [
  { id: 1, name: 'Alice Johnson' },
  { id: 2, name: 'Bob Smith' },
  { id: 3, name: 'Carol Lee' },
];

export const mockInitiatives: Initiative[] = [
  {
    id: 1,
    title: 'Launch Q3 Marketing Campaign',
    description: 'Coordinate with marketing and sales to launch the new campaign.',
    status: 'in_progress',
    tags: ['Strategic'],
    dueDate: '2025-07-15',
    assignees: [1, 2],
    teamLabel: 'Marketing',
    allocations: [
      { userId: 1, percent: 60 },
      { userId: 2, percent: 40 },
    ],
  },
  {
    id: 2,
    title: 'Migrate Database',
    description: 'Move production database to new cloud provider.',
    status: 'not_started',
    tags: ['Tech Debt'],
    dueDate: undefined,
    assignees: [3],
    teamLabel: 'Engineering',
    allocations: [
      { userId: 3, percent: 100 },
    ],
  },
  {
    id: 3,
    title: 'Quarterly Planning',
    description: 'Prepare and run Q3 planning session.',
    status: 'completed',
    tags: ['BAU'],
    dueDate: '2025-06-20',
    assignees: [1],
    teamLabel: 'Management',
    allocations: [
      { userId: 1, percent: 100 },
    ],
  },
  {
    id: 4,
    title: 'Refactor Onboarding Flow',
    description: 'Improve onboarding UX and reduce drop-off.',
    status: 'blocked',
    tags: ['Strategic', 'Tech Debt'],
    dueDate: '2025-07-30',
    assignees: [],
    teamLabel: 'Product',
    allocations: [],
  },
];


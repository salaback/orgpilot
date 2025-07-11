import type { Task, Tag } from './task';

export interface Meeting {
  id: number;
  title: string;
  meeting_time: string;
  status: string;
  meeting_series?: { id: number; title: string };
  participants: Array<{ id: number; first_name: string; last_name: string }>;
  tasks: Task[];
  tags: Tag[];
  duration_minutes?: number;
  location?: string;
  agenda?: string;
  summary?: string;
  // Add additional fields as needed
} 
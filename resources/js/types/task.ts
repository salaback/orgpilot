export interface Tag {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  initiative_id?: number;
  assigned_to?: number;
  created_by: number;
  due_date?: string;
  percentage_complete: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  created_at: string;
  updated_at: string;
  initiative?: { id: number; title: string };
  assigned_to_node?: { id: number; first_name: string; last_name: string; email: string | null };
  created_by_user?: { id: number; first_name: string; last_name: string };
  tags?: Tag[];
  notes?: Array<{
    id: number;
    title?: string;
    content: string;
    created_at: string;
    updated_at: string;
    tags?: Tag[];
  }>;
  // For one-on-one meeting flows
  task_type?: string;
} 
export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  notes: string | null;
  createdAt: Date;
  orderIndex?: number;
}

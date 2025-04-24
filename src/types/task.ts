export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 1 | 2 | 3; // 1 (High), 2 (Medium), 3 (Low)
  dueDate?: Date | string | null;
  category?: string | null;
  tags?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export const PriorityLabels: Record<number, string> = {
  1: 'High',
  2: 'Medium',
  3: 'Low'
};

export const StatusLabels: Record<string, string> = {
  'TODO': 'To Do',
  'IN_PROGRESS': 'In Progress',
  'DONE': 'Done'
};

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  dueDate?: string; // Format: YYYY-MM-DD
  todayOrder?: number; // Used for reordering in Today's Focus view
  isDaily?: boolean; // Whether the task recurs every day
  lastCompletedDate?: string; // Format: YYYY-MM-DD, tracks the last day it was done
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  subtasks: Subtask[];
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  tasks: Task[];
  color: string;
}

export type LayoutMode = 'grid' | 'list';
export type ViewMode = 'category' | 'today';

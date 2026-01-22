
export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
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

export interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string | null;
  dueDate: string;
  status: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface TasksKanbanProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
}

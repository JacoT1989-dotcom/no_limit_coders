import {
  ColumnState,
  TaskStatus,
  Priority as PrismaPriority,
  TeamRole,
  UserRole,
} from "@prisma/client";

export type User = {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
};

export type TaskColumn = {
  id: string;
  name: ColumnState;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  projectId: string;
};

export type ProjectTeamMember = {
  id: string;
  role: TeamRole;
  userId: string;
  projectId: string;
  user: User;
};

export type TaskAttachment = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  taskId: string;
  uploaderId: string;
};

export type TaskComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorId: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: PrismaPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  column: TaskColumn;
  assignees: ProjectTeamMember[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
};

export type ProjectOption = {
  id: string;
  name: string;
  tasks: Task[];
  customerId: string;
  customer: {
    id: string;
    displayName: string;
  };
  team: ProjectTeamMember[];
  availableDevelopers?: User[];
  assignedDevelopersByTask?: { [taskId: string]: Set<string> };
};

// Re-export Priority from Prisma
export { PrismaPriority as Priority };

// Kanban board specific types
export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

export interface TasksKanbanProps {
  status?: TaskStatus;
  assignee?: string;
  project?: string;
  dueDate?: string;
}

// Dialog and form types
export interface CreateTaskDialogProps {
  projectId: string;
  projectName: string;
  onTaskCreated?: () => void;
}

export interface TaskFormValues {
  name: string;
  projectId: string;
  description: string;
  priority: PrismaPriority;
  attachments: FileList | null;
  dueDate: string;
  status: TaskStatus;
}

// Helper functions
export const formatTaskForKanban = (task: Task) => ({
  ...task,
  project: task.column.projectId,
  assignee: task.assignees[0]?.userId || null,
  dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
});

export const columnToStatusMap: Record<ColumnState, TaskStatus> = {
  TODO: TaskStatus.TODO,
  BACKLOG: TaskStatus.REVIEW,
  IN_PROGRESS: TaskStatus.IN_PROGRESS,
  DONE: TaskStatus.COMPLETED,
};

export const getStatusColor = (status: TaskStatus) => {
  const colors = {
    [TaskStatus.TODO]: "bg-gray-100 text-gray-800",
    [TaskStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
    [TaskStatus.REVIEW]: "bg-yellow-100 text-yellow-800",
    [TaskStatus.COMPLETED]: "bg-green-100 text-green-800",
  };
  return colors[status] || colors[TaskStatus.TODO];
};

export const getPriorityColor = (priority: PrismaPriority) => {
  const colors = {
    [PrismaPriority.LOW]: "bg-blue-100 text-blue-800",
    [PrismaPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
    [PrismaPriority.HIGH]: "bg-orange-100 text-orange-800",
    [PrismaPriority.URGENT]: "bg-red-100 text-red-800",
  };
  return colors[priority] || colors[PrismaPriority.MEDIUM];
};

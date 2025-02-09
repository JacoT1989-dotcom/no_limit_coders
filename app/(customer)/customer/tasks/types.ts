import { ColumnState, TaskStatus } from "@prisma/client";

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
  role: string;
  userId: string;
  projectId: string;
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
  priority: Priority;
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
};

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface CreateTaskDialogProps {
  projectId: string;
  projectName: string;
  onTaskCreated?: () => void;
}

export interface TaskFormValues {
  name: string;
  projectId: string;
  description: string;
  priority: Priority;
  attachments: FileList | null;
  dueDate: string;
  status: TaskStatus; // Add this line using TaskStatus from @prisma/client
}

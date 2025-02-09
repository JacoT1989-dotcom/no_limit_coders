export type ProjectOption = {
  id: string;
  name: string;
};

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface CreateTaskDialogProps {
  projectId: string;
  projectName: string; // Add this to display project name
}

export interface TaskFormValues {
  name: string;
  projectId: string;
  description: string;
  priority: Priority;
  attachments: FileList | null;
  dueDate: string;
}

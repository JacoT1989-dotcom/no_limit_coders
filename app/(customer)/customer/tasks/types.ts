import { ProjectStatus, Priority, TeamRole, TaskStatus } from "@prisma/client";

export interface ProjectUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ProjectCustomer extends ProjectUser {
  phoneNumber: string;
  package: string;
}

export interface ProjectTeamMember {
  id: string;
  role: TeamRole;
  user: ProjectUser;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  uploader: {
    id: string;
    displayName: string;
  };
}

export interface TaskComment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface TaskAssignee {
  user: ProjectUser;
  role: TeamRole;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date | null;
  order: number;
  assignees: TaskAssignee[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
}

export interface TaskColumn {
  id: string;
  name: string;
  order: number;
  tasks: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
  }[];
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  status: ProjectStatus;
  priority: Priority;
  preferredMeeting: Date;
  createdAt: Date;
  updatedAt: Date;
  customer: ProjectCustomer;
  tasks: ProjectTask[];
  taskColumns: TaskColumn[];
  team: ProjectTeamMember[];
}

export interface ProjectResponse {
  project?: ProjectData;
  error?: string;
}

export interface ProjectsResponse {
  projects?: ProjectData[];
  error?: string;
}

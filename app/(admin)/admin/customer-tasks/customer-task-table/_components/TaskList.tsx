"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Task,
  getPriorityColor,
  getStatusColor,
} from "@/app/(customer)/customer/tasks/types";
import AttachmentsModal from "../../../_components/(quick-actions)/(customers-task-alerts)/AttacmentModal";
import { CommentsBadge } from "../(task-comments)/CommentsModal";
import { getCustomerProjects } from "../get-actions";
import AssigneesModal from "./AssigneesModal";

interface TaskListProps {
  filteredTasks: Task[];
  selectedTasks: string[];
  toggleTaskSelection: (taskId: string) => void;
  toggleSelectAll: () => void;
  onTasksRefreshed?: (tasks: Task[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  filteredTasks,
  selectedTasks,
  toggleTaskSelection,
  toggleSelectAll,
  onTasksRefreshed,
}) => {
  const [refreshingTasks, setRefreshingTasks] = useState(false);

  // Format date for display
  const formatDate = (dateString: Date | null | undefined) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "MMM d");
  };

  // Get user initials for Avatar
  const getUserInitials = (user: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
  }) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.displayName) {
      return user.displayName[0];
    }
    return "U";
  };

  // Function to refresh tasks
  const refreshTasks = async () => {
    setRefreshingTasks(true);
    try {
      const response = await getCustomerProjects();
      if (response.projects && onTasksRefreshed) {
        // Extract all tasks from all projects
        const allTasks = response.projects.flatMap((project) => project.tasks);
        onTasksRefreshed(allTasks);
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    } finally {
      setRefreshingTasks(false);
    }
  };

  // Prepare assignees for the modal
  const formatAssignees = (
    assignees: Array<{
      id: string;
      role: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        displayName?: string;
        email: string;
        avatarUrl?: string;
      };
    }>,
  ) => {
    return assignees.map((assignee) => ({
      id: assignee.id,
      role: assignee.role,
      user: {
        id: assignee.user.id,
        firstName: assignee.user.firstName,
        lastName: assignee.user.lastName,
        email: assignee.user.email,
        imageUrl: assignee.user.avatarUrl, // Map avatarUrl to imageUrl if available
      },
    }));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedTasks.length === filteredTasks.length &&
                  filteredTasks.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead>Attachments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={() => toggleTaskSelection(task.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                {task.description
                  ? task.description.substring(0, 30) +
                    (task.description.length > 30 ? "..." : "")
                  : "-"}
              </TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </TableCell>
              <TableCell>{formatDate(task.createdAt)}</TableCell>
              <TableCell>{formatDate(task.updatedAt)}</TableCell>
              <TableCell>{formatDate(task.dueDate)}</TableCell>
              <TableCell>
                {task.assignees.length > 0 ? (
                  <AssigneesModal assignees={formatAssignees(task.assignees)} />
                ) : (
                  <span>-</span>
                )}
              </TableCell>
              <TableCell>
                <CommentsBadge
                  comments={task.comments}
                  taskId={task.id}
                  taskTitle={task.title}
                  onRefresh={refreshTasks}
                />
              </TableCell>
              <TableCell>
                <AttachmentsModal attachments={task.attachments} />
              </TableCell>
            </TableRow>
          ))}
          {filteredTasks.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center">
                No tasks found matching the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskList;

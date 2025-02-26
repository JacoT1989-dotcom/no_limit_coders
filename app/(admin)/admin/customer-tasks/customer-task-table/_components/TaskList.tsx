"use client";

import React from "react";
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
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import {
  Task,
  getPriorityColor,
  getStatusColor,
} from "@/app/(customer)/customer/tasks/types";
import AttachmentsModal from "../../../_components/(quick-actions)/(customers-task-alerts)/(reply_to_subject)/AttacmentModal";
import { CommentsBadge } from "../(task-comments)/CommentsModal";

interface TaskListProps {
  filteredTasks: Task[];
  selectedTasks: string[];
  toggleTaskSelection: (taskId: string) => void;
  toggleSelectAll: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  filteredTasks,
  selectedTasks,
  toggleTaskSelection,
  toggleSelectAll,
}) => {
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

  // Function to refresh tasks (this would be passed down from the parent)
  const refreshTasks = () => {
    // In a real implementation, this would trigger a refresh of the task list
    console.log("Refreshing tasks...");
    // This should be implemented in the parent component and passed down as a prop
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
                <div className="flex items-center">
                  {task.assignees.length > 0 ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(task.assignees[0].user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2">{task.assignees.length}</span>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {/* Replace the static comment count with the CommentsBadge component */}
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

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ProjectOption, Task } from "../../types";
import { getCustomerProjects } from "../../actions";
import { CommentsBadge } from "./CommentsModal";
import {
  isWithinDueDate,
  getStatusColor,
  getPriorityColor,
} from "./table-utils";
import TaskDialog from "./task-dialog";
import DeleteTasksModal from "./DeleteTasksModal";
import AssigneesModal from "./AssigneesModal";
import { AttachmentsBadge } from "./AttachmentModal";

interface TasksTableProps {
  status?: string;
  assignee?: string;
  project?: string;
  dueDate?: string;
  projects: ProjectOption[];
  onAvailableDates: (dates: string[]) => void;
}

const TasksTable = ({
  status,
  assignee,
  project,
  dueDate,
  projects,
  onAvailableDates,
}: TasksTableProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!project || project === "all") {
      setTasks([]);
      return;
    }

    const selectedProject = projects.find((p) => p.id === project);
    if (selectedProject) {
      setTasks(selectedProject.tasks);
    }
  }, [project, projects]);

  useEffect(() => {
    const availableDates = ["all"];
    const hasTasksForToday = tasks.some((task) =>
      isWithinDueDate(task.dueDate, task.createdAt, "today"),
    );
    const hasTasksForWeek = tasks.some((task) =>
      isWithinDueDate(task.dueDate, task.createdAt, "week"),
    );
    const hasTasksForMonth = tasks.some((task) =>
      isWithinDueDate(task.dueDate, task.createdAt, "month"),
    );

    if (hasTasksForToday) availableDates.push("today");
    if (hasTasksForWeek) availableDates.push("week");
    if (hasTasksForMonth) availableDates.push("month");

    onAvailableDates(availableDates);
  }, [tasks, onAvailableDates]);

  const refreshTasks = async () => {
    if (!project || project === "all") return;

    setIsRefreshing(true);
    try {
      const result = await getCustomerProjects();
      if (result.projects) {
        const updatedProject = result.projects.find((p) => p.id === project);
        if (updatedProject) {
          setTasks(updatedProject.tasks);
        }
      }
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteTasks = () => {
    console.log("Deleting tasks:", selectedTasks);
    setSelectedTasks([]);
    refreshTasks();
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleAllTasks = () => {
    setSelectedTasks((prev) =>
      prev.length === filteredTasks.length
        ? []
        : filteredTasks.map((task) => task.id),
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        !status ||
        status === "all" ||
        task.status.toLowerCase() === status.toLowerCase();
      const matchesAssignee =
        !assignee ||
        assignee === "all" ||
        task.assignees.some((a) => a.userId === assignee);
      const matchesDueDate = isWithinDueDate(
        task.dueDate,
        task.createdAt,
        dueDate,
      );

      return matchesStatus && matchesAssignee && matchesDueDate;
    });
  }, [tasks, status, assignee, dueDate]);

  if (!project || project === "all") {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Please select a project to view tasks
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {selectedTasks.length} of {filteredTasks.length} row(s) selected
          </span>
          {selectedTasks.length > 0 && (
            <DeleteTasksModal
              selectedCount={selectedTasks.length}
              onDelete={handleDeleteTasks}
            />
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTasks}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh Tasks"}
          </Button>
          <span className="text-red-600 font-semibold">
            {formatDate(new Date())}
          </span>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className={cn("w-full caption-bottom text-sm border-collapse")}>
          <thead>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium w-[50px]">
                <Checkbox
                  checked={
                    filteredTasks.length > 0 &&
                    selectedTasks.length === filteredTasks.length
                  }
                  onCheckedChange={toggleAllTasks}
                />
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[180px]">
                Title
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[200px]">
                Description
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Priority
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Created
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Updated
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Due Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[120px]">
                Assignees
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Comments
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                Attachments
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">
                  <Checkbox
                    checked={selectedTasks.includes(task.id)}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                  />
                </td>
                <td className="p-4 align-middle max-w-[180px]">
                  <TaskDialog title={task.title} description="" />
                </td>
                <td className="p-4 align-middle max-w-[200px]">
                  <TaskDialog
                    title={task.description || "No description"}
                    description=""
                  />
                </td>
                <td className="p-4 align-middle">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </td>
                <td className="p-4 align-middle whitespace-nowrap">
                  {formatDate(task.createdAt)}
                </td>
                <td className="p-4 align-middle whitespace-nowrap">
                  {formatDate(task.updatedAt)}
                </td>
                <td className="p-4 align-middle whitespace-nowrap">
                  {task.dueDate ? formatDate(task.dueDate) : "-"}
                </td>
                <td className="p-4 align-middle">
                  <AssigneesModal assignees={task.assignees} />
                </td>
                <td className="p-4 align-middle">
                  <CommentsBadge
                    comments={task.comments}
                    taskTitle={task.title}
                  />
                </td>
                <td className="p-4 align-middle">
                  <AttachmentsBadge attachments={task.attachments} />
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="p-4 text-center text-muted-foreground"
                >
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(TasksTable);

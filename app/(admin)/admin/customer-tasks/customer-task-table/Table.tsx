"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Paperclip, RefreshCcw } from "lucide-react";
import {
  ProjectOption,
  Task,
  Priority,
  getPriorityColor,
  getStatusColor,
} from "@/app/(customer)/customer/tasks/types";
import { format } from "date-fns";
import { TaskStatus } from "@prisma/client";
import { getCustomerProjects } from "./get-actions";

const TasksTable: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all-statuses");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all-assignees");
  const [dateFilter, setDateFilter] = useState<string>("all-dates");
  const [error, setError] = useState<string | null>(null);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getCustomerProjects();

        if (response.error) {
          setError(response.error);
        } else if (response.projects && response.projects.length > 0) {
          setProjects(response.projects);
          setSelectedProject(response.projects[0].id);
        }
      } catch (err: any) {
        // Handle redirect errors specifically
        if (
          err.digest &&
          err.digest.includes("NEXT_REDIRECT") &&
          err.digest.includes("/login")
        ) {
          // This is an authentication error, handle gracefully
          setError("Authentication required. Please login to view projects.");
          console.error("Authentication error:", err);

          // Optional: redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setError(
            "Failed to fetch projects data: " + (err.message || String(err)),
          );
          console.error("Project fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Get current project's tasks
  const currentProject = projects.find((p) => p.id === selectedProject);
  const tasks = currentProject?.tasks || [];

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (statusFilter !== "all-statuses") {
      const status = statusFilter
        .toUpperCase()
        .replace(/-/g, "_") as TaskStatus;
      if (task.status !== status) return false;
    }

    // Assignee filter
    if (assigneeFilter === "unassigned" && task.assignees.length > 0)
      return false;

    // Date filter
    if (dateFilter !== "all-dates" && task.dueDate) {
      const today = new Date();
      const dueDate = new Date(task.dueDate);

      if (dateFilter === "today") {
        if (dueDate.toDateString() !== today.toDateString()) return false;
      } else if (dateFilter === "this-week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (dueDate < weekStart || dueDate > weekEnd) return false;
      } else if (dateFilter === "this-month") {
        if (
          dueDate.getMonth() !== today.getMonth() ||
          dueDate.getFullYear() !== today.getFullYear()
        )
          return false;
      }
    }

    return true;
  });

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Select/deselect all tasks
  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map((task) => task.id));
    }
  };

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

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getCustomerProjects();
      if (response.error) {
        setError(response.error);
      } else if (response.projects) {
        setProjects(response.projects);
        if (response.projects.length > 0 && !selectedProject) {
          setSelectedProject(response.projects[0].id);
        }
        // Clear any previous errors
        setError(null);
      }
    } catch (err: any) {
      // Handle redirect errors specifically
      if (
        err.digest &&
        err.digest.includes("NEXT_REDIRECT") &&
        err.digest.includes("/login")
      ) {
        // This is an authentication error, handle gracefully
        setError("Authentication required. Please login to view projects.");
        console.error("Authentication error:", err);

        // Redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(
          "Failed to refresh projects data: " + (err.message || String(err)),
        );
        console.error("Project refresh error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 my-4">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800">
            Error Loading Projects
          </h3>
        </div>
        <div className="mt-2 text-sm text-red-700">
          <p>{error}</p>
        </div>
        {error.includes("Authentication required") && (
          <div className="mt-4">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 my-4">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-yellow-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800">
            No Projects Found
          </h3>
        </div>
        <div className="mt-2 text-sm text-yellow-700">
          <p>
            There are no projects associated with your account. Please contact
            your administrator for assistance.
          </p>
        </div>
        <div className="mt-4">
          <Button
            onClick={handleRefresh}
            className="text-yellow-700 bg-yellow-100 hover:bg-yellow-200 inline-flex items-center"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers Project Tasks Table</h1>
      </div>

      <p className="text-gray-600">
        Viewing {filteredTasks.length} tasks in {currentProject?.name || ""}
        {currentProject?.customer?.displayName
          ? ` [${currentProject.customer.displayName}]`
          : ""}
      </p>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                  {project.customer?.displayName
                    ? ` [${project.customer.displayName}]`
                    : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="todo">Todo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-assignees">All assignees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {currentProject?.team.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.user.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-dates">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {selectedTasks.length} of {filteredTasks.length} row(s) selected
          </span>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-600 flex items-center space-x-2"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh Tasks</span>
            </Button>
            <span className="text-red-600">{format(new Date(), "MMM d")}</span>
          </div>
        </div>

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
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{task.comments.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{task.attachments.length}</span>
                    </div>
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
      </div>
    </div>
  );
};

export default TasksTable;

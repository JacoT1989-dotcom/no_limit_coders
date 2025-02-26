"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import { getCustomerProjects } from "./get-actions";
import { ProjectOption, Task } from "@/app/(customer)/customer/tasks/types";
import ProjectSelector from "./_components/ProjectSelector";
import TaskFilters from "./_components/TaskFilters";
import TaskList from "./_components/TaskList";

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
    if (
      assigneeFilter !== "all-assignees" &&
      assigneeFilter !== "unassigned" &&
      !task.assignees.some((assignee) => assignee.userId === assigneeFilter)
    )
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
      {/* Project Selector Component */}
      <ProjectSelector
        projects={projects}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        loading={loading}
        handleRefresh={handleRefresh}
        filteredTasksCount={filteredTasks.length}
      />

      {/* Task Filters Component */}
      <TaskFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        selectedTasks={selectedTasks}
        filteredTasksCount={filteredTasks.length}
        currentProject={currentProject}
      />

      {/* Task List Component */}
      <TaskList
        filteredTasks={filteredTasks}
        selectedTasks={selectedTasks}
        toggleTaskSelection={toggleTaskSelection}
        toggleSelectAll={toggleSelectAll}
      />
    </div>
  );
};

export default TasksTable;

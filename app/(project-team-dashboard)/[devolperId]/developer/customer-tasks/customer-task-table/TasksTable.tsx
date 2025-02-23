"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Paperclip, Users } from "lucide-react";
import TasksTableSkeleton from "./TasksTableSkeleton";
import { ProjectOption } from "@/app/(customer)/customer/tasks/types";
import { getDeveloperProjects } from "./actions";
import AssigneesModal from "./AssigneesModal";
import CommentsModal from "./CommentsModal";
import AttachmentsModal from "./AttachmentsModal";

const TasksTable = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Flatten all tasks from all projects
  const tasks = projects.flatMap((project) =>
    project.tasks.map((task) => ({
      ...task,
      projectName: project.name,
    })),
  );

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getDeveloperProjects();
        if (result.error) {
          setError(result.error);
        } else if (result.projects) {
          setProjects(result.projects);
        }
      } catch (err) {
        setError("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleAllTasks = () => {
    setSelectedTasks((prev) =>
      prev.length === tasks.length ? [] : tasks.map((task) => task.id),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "review":
        return "dark:bg-purple-900 dark:text-purple-100 bg-purple-100 text-purple-700";
      case "todo":
        return "dark:bg-red-900 dark:text-red-100 bg-red-100 text-red-700";
      case "in_progress":
        return "dark:bg-yellow-900 dark:text-yellow-100 bg-yellow-100 text-yellow-700";
      case "completed":
        return "dark:bg-green-900 dark:text-green-100 bg-green-100 text-green-700";
      default:
        return "dark:bg-gray-800 dark:text-gray-100 bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return <TasksTableSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full p-6" role="region" aria-label="Tasks List">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="w-12 p-4 text-left">
              <div className="flex items-center">
                <input
                  id="select-all-tasks"
                  type="checkbox"
                  checked={selectedTasks.length === tasks.length}
                  onChange={toggleAllTasks}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  aria-label="Select all tasks"
                />
                <label htmlFor="select-all-tasks" className="sr-only">
                  Select all tasks
                </label>
              </div>
            </th>
            <th className="min-w-[200px] p-4 text-left">Task Name</th>
            <th className="min-w-[200px] p-4 text-left">Project</th>
            <th className="p-4 text-left">Due Date</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="p-4">
                <div className="flex items-center">
                  <input
                    id={`select-task-${task.id}`}
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    aria-label={`Select ${task.title}`}
                  />
                  <label htmlFor={`select-task-${task.id}`} className="sr-only">
                    Select {task.title}
                  </label>
                </div>
              </td>
              <td className="p-4 font-medium dark:text-white">{task.title}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                    aria-hidden="true"
                  >
                    {task.projectName[0]}
                  </span>
                  <span className="dark:text-gray-200">{task.projectName}</span>
                </div>
              </td>
              <td className="p-4 text-gray-500 dark:text-gray-400">
                {task.dueDate ? formatDate(task.dueDate) : "No due date"}
              </td>
              <td className="p-4">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    task.status,
                  )}`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-4">
                  <CommentsModal task={task} />
                  <AttachmentsModal task={task} />
                  <AssigneesModal task={task} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        className="mt-4 text-sm text-gray-500 dark:text-gray-400"
        role="status"
      >
        {selectedTasks.length} of {tasks.length} row(s) selected
      </div>
    </div>
  );
};

export default React.memo(TasksTable);

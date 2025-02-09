"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TasksTable from "./_components/TasksTable";
import TasksKanban from "./_components/TasksKanban";
import TasksCalendar from "./_components/TaskCalendar";
import { getCustomerProjects } from "./actions";
import { ProjectOption } from "./types";
import { CreateTaskDialog } from "./(create_task)/CreateTaskDialog";

const ProjectTasks = () => {
  const [activeView, setActiveView] = useState("table");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDueDate, setSelectedDueDate] = useState("all");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects with loading and error handling
  const fetchProjects = async () => {
    try {
      const result = await getCustomerProjects();

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.projects) {
        setProjects(result.projects);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handler for task creation success
  const handleTaskCreated = async () => {
    await fetchProjects(); // Refresh projects data after task creation
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  const renderView = () => {
    if (error) {
      return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    // Don't render any view component if no project is selected or if "all" is selected
    if (!selectedProject || selectedProject === "all") {
      return (
        <div className="text-center p-4 text-muted-foreground">
          Please select a project to view tasks
        </div>
      );
    }

    // Log the props being passed to the view components
    console.log("View props:", {
      status: selectedStatus,
      assignee: selectedAssignee,
      project: selectedProject,
      dueDate: selectedDueDate,
      projectData: selectedProjectData,
    });

    switch (activeView) {
      case "table":
        return (
          <TasksTable
            status={selectedStatus}
            assignee={selectedAssignee}
            project={selectedProject}
            dueDate={selectedDueDate}
          />
        );
      case "kanban":
        return (
          <TasksKanban
            status={selectedStatus}
            assignee={selectedAssignee}
            project={selectedProject}
            dueDate={selectedDueDate}
            projects={projects}
          />
        );
      case "calendar":
        return (
          <TasksCalendar
            status={selectedStatus}
            assignee={selectedAssignee}
            project={selectedProject}
            dueDate={selectedDueDate}
            projects={projects}
          />
        );
      default:
        return (
          <TasksTable
            status={selectedStatus}
            assignee={selectedAssignee}
            project={selectedProject}
            dueDate={selectedDueDate}
          />
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">
              {selectedProjectData
                ? `Viewing ${selectedProjectData.tasks.length} tasks in ${selectedProjectData.name}`
                : "View all of your tasks here"}
            </p>
          </div>
          {selectedProject !== "all" && (
            <CreateTaskDialog
              projectId={selectedProject}
              projectName={selectedProjectData?.name || ""}
              onTaskCreated={handleTaskCreated}
            />
          )}
        </div>

        {/* Project Selection */}
        <div className="flex flex-col gap-2">
          <div>
            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
                console.log(
                  "Selected project:",
                  value,
                  projects.find((p) => p.id === value),
                );
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select a Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Type Tabs */}
          {selectedProject !== "all" && (
            <div>
              <Button
                variant={activeView === "table" ? "secondary" : "ghost"}
                onClick={() => setActiveView("table")}
              >
                Table
              </Button>
              <Button
                variant={activeView === "kanban" ? "secondary" : "ghost"}
                onClick={() => setActiveView("kanban")}
              >
                Kanban
              </Button>
              <Button
                variant={activeView === "calendar" ? "secondary" : "ghost"}
                onClick={() => setActiveView("calendar")}
              >
                Calendar
              </Button>
            </div>
          )}
        </div>

        {/* Filter Buttons - Only show when a project is selected */}
        {selectedProject !== "all" && (
          <div className="flex gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <span>All statuses</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <span>All assignees</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                <SelectItem value="john">John</SelectItem>
                <SelectItem value="antonio">Antonio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDueDate} onValueChange={setSelectedDueDate}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <span>Due date</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Render Active View */}
        {renderView()}
      </div>
    </div>
  );
};

export default ProjectTasks;

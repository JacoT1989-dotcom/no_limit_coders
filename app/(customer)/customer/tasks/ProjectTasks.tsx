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
import TasksTable from "./_components/(table)/TasksTable";
import TasksKanban from "./_components/TasksKanban";
import { getCustomerProjects } from "./actions";
import { ProjectOption, ProjectTeamMember } from "./types";
import { CreateTaskDialog } from "./(create_task)/CreateTaskDialog";
import TasksCalendar from "./_components/(calendar)/TaskCalendar";

const ProjectTasks = () => {
  const [activeView, setActiveView] = useState("table");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDueDate, setSelectedDueDate] = useState("all");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>(["all"]);

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

  const handleTaskCreated = async () => {
    await fetchProjects();
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  const renderView = () => {
    if (error) {
      return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }

    if (!selectedProject || selectedProject === "all") {
      return (
        <div className="text-center p-4 text-muted-foreground">
          Please select a project to view tasks
        </div>
      );
    }

    switch (activeView) {
      case "table":
        return (
          <TasksTable
            status={selectedStatus}
            assignee={selectedAssignee}
            project={selectedProject}
            dueDate={selectedDueDate}
            projects={projects}
            onAvailableDates={setAvailableDates}
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
            projects={projects}
            onAvailableDates={setAvailableDates}
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

        <div className="flex flex-col gap-2">
          <div>
            <Select
              value={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value);
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

        {selectedProject !== "all" && activeView === "table" && (
          <div className="flex gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {selectedStatus === "all"
                    ? "All statuses"
                    : selectedStatus === "in-progress"
                      ? "In Progress"
                      : selectedStatus.charAt(0).toUpperCase() +
                        selectedStatus.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="TODO">Todo</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {selectedAssignee === "all"
                    ? "All assignees"
                    : selectedProjectData?.tasks
                        .flatMap((task) => task.assignees)
                        .find((member) => member.user.id === selectedAssignee)
                        ?.user.displayName || "All assignees"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assignees</SelectItem>
                {selectedProjectData?.tasks
                  .flatMap((task) => task.assignees)
                  .filter(
                    (member, index, self) =>
                      index ===
                      self.findIndex((m) => m.user.id === member.user.id),
                  )
                  .map((member: ProjectTeamMember) => (
                    <SelectItem key={member.user.id} value={member.user.id}>
                      {member.user.displayName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={selectedDueDate} onValueChange={setSelectedDueDate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  {selectedDueDate === "all"
                    ? "All dates"
                    : selectedDueDate === "today"
                      ? "Today"
                      : selectedDueDate === "week"
                        ? "This week"
                        : selectedDueDate === "month"
                          ? "This month"
                          : selectedDueDate}
                </SelectValue>
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

        {renderView()}
      </div>
    </div>
  );
};

export default ProjectTasks;

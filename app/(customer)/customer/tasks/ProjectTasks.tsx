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
import { CreateTaskDialog } from "./CreateTaskDialog";

const ProjectTasks = () => {
  const [activeView, setActiveView] = useState("table");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDueDate, setSelectedDueDate] = useState("all");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const result = await getCustomerProjects();
      if (result.error) {
        setError(result.error);
      } else if (result.projects) {
        setProjects(result.projects);
      }
    };
    fetchProjects();
  }, []);

  const renderView = () => {
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
          />
        );
      case "calendar":
        return (
          <TasksCalendar
            status={selectedStatus}
            assignee={selectedAssignee}
            project={selectedProject}
            dueDate={selectedDueDate}
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
            <p className="text-muted-foreground">View all of your tasks here</p>
          </div>
          <CreateTaskDialog projectId={selectedProject} />
        </div>

        {/* Project Selection */}
        <div className="flex flex-col gap-2">
          <div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
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
        </div>

        {/* Filter Buttons */}
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

          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
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

          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <span>All projects</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
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

        {/* Render Active View */}
        {renderView()}
      </div>
    </div>
  );
};

export default ProjectTasks;

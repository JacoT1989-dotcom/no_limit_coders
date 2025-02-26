"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectOption } from "@/app/(customer)/customer/tasks/types";

interface ProjectSelectorProps {
  projects: ProjectOption[];
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  loading: boolean;
  handleRefresh: () => Promise<void>;
  filteredTasksCount: number;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  selectedProject,
  setSelectedProject,
  loading,
  handleRefresh,
  filteredTasksCount,
}) => {
  // Find the current project
  const currentProject = projects.find((p) => p.id === selectedProject);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers Project Tasks Table</h1>
      </div>

      <p className="text-gray-600">
        Viewing {filteredTasksCount} tasks in {currentProject?.name || ""}
        {currentProject?.customer?.displayName
          ? ` [${currentProject.customer.displayName}]`
          : ""}
      </p>

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

        <Button
          variant="ghost"
          className="text-gray-600 flex items-center space-x-2"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Projects</span>
        </Button>
      </div>
    </div>
  );
};

export default ProjectSelector;

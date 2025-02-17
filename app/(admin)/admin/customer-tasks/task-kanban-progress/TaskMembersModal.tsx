"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { getCustomerProjects } from "./get-actions";
import { ProjectOption, User } from "@/app/(customer)/customer/tasks/types";
import { assignTeamMemberToTask } from "./assign-member-action";

interface TaskMembersModalProps {
  onUpdate: () => Promise<void>;
  selectedProjectId: string;
}

const TaskMembersModal = ({
  onUpdate,
  selectedProjectId,
}: TaskMembersModalProps) => {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await getCustomerProjects();
        if (response.projects) {
          setProjects(response.projects);
        }
      } catch (error) {
        toast.error("Failed to load projects");
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const selectedProjectData = useMemo(() => {
    return projects.find((p) => p.id === selectedProject);
  }, [projects, selectedProject]);

  const selectedTaskData = useMemo(() => {
    if (!selectedProjectData || !selectedTask) return null;
    return selectedProjectData.tasks.find((t) => t.id === selectedTask);
  }, [selectedProjectData, selectedTask]);

  const currentAssignees = useMemo(() => {
    if (!selectedTaskData) return [];
    return selectedTaskData.assignees
      .filter((assignee) => assignee.user.role === "DEVELOPER")
      .map((assignee) => ({
        id: assignee.user.id,
        displayName: assignee.user.displayName,
        role: assignee.user.role,
      }));
  }, [selectedTaskData]);

  const availableDevelopers = useMemo(() => {
    if (!selectedProjectData || !selectedTask) return [];

    const developers = selectedProjectData.availableDevelopers || [];
    const assignedIds = new Set(currentAssignees.map((a) => a.id));

    return developers.filter((dev) => !assignedIds.has(dev.id));
  }, [selectedProjectData, selectedTask, currentAssignees]);

  const handleAssign = async () => {
    if (!selectedTask || !selectedMember) {
      toast.error("Please select both a task and a team member");
      return;
    }

    setIsLoading(true);
    try {
      const response = await assignTeamMemberToTask(
        selectedTask,
        selectedMember,
      );

      if (response.success) {
        toast.success("Team member assigned successfully");
        setOpen(false);
        setSelectedTask("");
        setSelectedMember("");
        await onUpdate();
      } else {
        toast.error(response.error || "Failed to assign team member");
      }
    } catch (error) {
      toast.error("Failed to assign team member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 mb-6">
      <Toaster richColors position="top-right" />
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Task Management</h2>
            <p className="text-sm text-muted-foreground">
              Assign team members to specific tasks
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="red-gradient text-white hover:opacity-90">
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Members
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
              <DialogHeader>
                <DialogTitle>Assign Team Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Project Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedProject(value);
                      setSelectedTask("");
                      setSelectedMember("");
                    }}
                    value={selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} [{project.customer.displayName}]
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Task Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Task</label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedTask(value);
                      setSelectedMember("");
                    }}
                    value={selectedTask}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task..." />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProjectData?.tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Assignees */}
                {currentAssignees.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Current Assignees
                    </label>
                    <div className="p-2 bg-muted rounded-md">
                      {currentAssignees.map((assignee) => (
                        <div key={assignee.id} className="text-sm py-1">
                          {assignee.displayName} (Developer)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Developer Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To</label>
                  <Select
                    onValueChange={setSelectedMember}
                    value={selectedMember}
                    disabled={!selectedTask}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevelopers.length > 0 ? (
                        <SelectGroup>
                          <SelectLabel>Available Developers</SelectLabel>
                          {availableDevelopers.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              {dev.displayName} (Developer)
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ) : (
                        <SelectItem value="none" disabled>
                          No available developers for this task
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full red-gradient text-white hover:opacity-90"
                  onClick={handleAssign}
                  disabled={isLoading || !selectedTask || !selectedMember}
                >
                  {isLoading ? "Assigning..." : "Assign Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};

export default TaskMembersModal;

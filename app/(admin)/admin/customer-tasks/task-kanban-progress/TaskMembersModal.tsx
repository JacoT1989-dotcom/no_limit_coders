"use client";

import React, { useState, useEffect } from "react";
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
import { ProjectOption } from "@/app/(customer)/customer/tasks/types";
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
        console.error("Error loading projects:", error);
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

  // Get tasks and team members for selected project
  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const projectTasks = selectedProjectData?.tasks || [];
  const projectTeamMembers = selectedProjectData?.team || [];
  const availableDevelopers = selectedProjectData?.availableDevelopers || [];

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
        // Reset selections
        setSelectedTask("");
        setSelectedMember("");
        setSelectedProject("");
        // Refresh the projects data
        await onUpdate();
      } else {
        toast.error(response.error || "Failed to assign team member");
      }
    } catch (error) {
      console.error("Error assigning team member:", error);
      toast.error("Failed to assign team member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedMember("");
      setSelectedTask("");
      if (selectedProjectId) {
        setSelectedProject(selectedProjectId);
      } else {
        setSelectedProject("");
      }
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
          <Dialog open={open} onOpenChange={handleDialogChange}>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select
                    onValueChange={setSelectedProject}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Task</label>
                  <Select
                    onValueChange={setSelectedTask}
                    value={selectedTask}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To</label>
                  <Select
                    onValueChange={setSelectedMember}
                    value={selectedMember}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTeamMembers.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Current Team</SelectLabel>
                          {projectTeamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.user.displayName} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {availableDevelopers?.length > 0 && (
                        <SelectGroup>
                          <SelectLabel>Available Developers</SelectLabel>
                          {availableDevelopers.map((dev) => (
                            <SelectItem key={dev.id} value={dev.id}>
                              {dev.displayName} (Developer)
                            </SelectItem>
                          ))}
                        </SelectGroup>
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

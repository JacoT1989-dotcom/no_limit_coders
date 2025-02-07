import React from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";

const members = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Antonio Rodriguez" },
  { id: 3, name: "Sarah Johnson" },
  { id: 4, name: "Michael Chen" },
];

const projects = [
  { id: 1, name: "Mobile App Development" },
  { id: 2, name: "Website Redesign" },
  { id: 3, name: "Marketing Campaign" },
];

const tasks = [
  { id: 1, name: "Design UI components", projectId: 1 },
  { id: 2, name: "Implement offline mode", projectId: 1 },
  { id: 3, name: "Create wireframes", projectId: 2 },
  { id: 4, name: "Content strategy", projectId: 3 },
];

const TaskMembersModal = () => {
  const [selectedMember, setSelectedMember] = React.useState<
    string | undefined
  >();
  const [selectedProject, setSelectedProject] = React.useState<
    string | undefined
  >();
  const [selectedTask, setSelectedTask] = React.useState<string | undefined>();

  const filteredTasks = tasks.filter((task) =>
    selectedProject ? task.projectId === parseInt(selectedProject) : true,
  );

  const handleAssign = () => {
    console.log({
      member: selectedMember,
      project: selectedProject,
      task: selectedTask,
    });
  };

  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedMember(undefined);
      setSelectedProject(undefined);
      setSelectedTask(undefined);
    }
  };

  return (
    <div className="px-6 mb-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Task Management</h2>
            <p className="text-sm text-muted-foreground">
              Assign team members to specific tasks
            </p>
          </div>
          <Dialog onOpenChange={handleDialogChange}>
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
                        <SelectItem
                          key={project.id}
                          value={project.id.toString()}
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Task</label>
                  <Select onValueChange={setSelectedTask} value={selectedTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Member</label>
                  <Select
                    onValueChange={setSelectedMember}
                    value={selectedMember}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem
                          key={member.id}
                          value={member.id.toString()}
                        >
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full red-gradient text-white hover:opacity-90"
                  onClick={handleAssign}
                >
                  Assign Member
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

"use client";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProjectOption, Task } from "../types";

interface DayTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  date: Date;
  project: ProjectOption | undefined;
}

const DayTasksDialog = ({
  isOpen,
  onClose,
  tasks,
  date,
  project,
}: DayTasksDialogProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "backlog":
        return "bg-purple-100 text-purple-700";
      case "todo":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Tasks for {format(date, "MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh] pr-4">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{task.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          task.status,
                        )}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {task.assignees.map((assignee) => (
                          <Avatar
                            key={assignee.id}
                            className="h-6 w-6 border-2 border-background"
                          >
                            <AvatarFallback className="text-xs bg-accent/10 text-accent">
                              {assignee.userId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due:{" "}
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMM d")
                          : "No date"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DayTasksDialog;

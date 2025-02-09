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
        return "bg-purple-900 dark:bg-purple-950 text-white";
      case "todo":
        return "bg-red-600 dark:bg-red-800 text-white";
      case "in_progress":
        return "bg-yellow-600 dark:bg-yellow-800 text-white";
      case "done":
        return "bg-green-600 dark:bg-green-800 text-white";
      default:
        return "bg-gray-600 dark:bg-gray-800 text-white";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-white dark:bg-black border-red-600 dark:border-red-800 shadow-lg">
        <DialogHeader className="border-b border-red-200 dark:border-red-900 pb-4">
          <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-500">
            Tasks List {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[60vh] pr-4">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="hover:shadow-xl transition-all duration-300 border border-red-100 dark:border-red-900 bg-white dark:bg-black"
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                          task.status,
                        )}`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {task.assignees.map((assignee) => (
                          <Avatar
                            key={assignee.id}
                            className="h-8 w-8 border-2 border-white dark:border-black"
                          >
                            <AvatarFallback className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-100">
                              {assignee.userId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
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

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ProjectTeamMember {
  id: string;
  user: User;
  role: string;
}

interface AssigneesModalProps {
  assignees: ProjectTeamMember[];
}

const AssigneesModal = ({ assignees }: AssigneesModalProps) => {
  // Compute initials once for reuse
  const getInitials = (user: User) => {
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-[140px]">
          <Users className="h-4 w-4 mr-2" />
          {assignees.length} {assignees.length === 1 ? "Assignee" : "Assignees"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task Assignees</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {assignees.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No assignees for this task
            </div>
          ) : (
            assignees.map((assignee) => {
              const initials = getInitials(assignee.user);
              return (
                <div
                  key={assignee.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {assignee.user.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">{assignee.user.firstName}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignee.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize ml-2 shrink-0">
                    {assignee.role.toLowerCase()}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssigneesModal;

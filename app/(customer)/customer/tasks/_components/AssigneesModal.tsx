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
import { ProjectTeamMember } from "../types";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface AssigneesModalProps {
  assignees: ProjectTeamMember[];
}

const AssigneesModal = ({ assignees }: AssigneesModalProps) => {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0]}${lastName[0]}`;

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
          <DialogTitle>Assignees List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {assignees.map((assignee) => (
            <div
              key={assignee.id}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-xs">
                    {getInitials(
                      assignee.user.firstName,
                      assignee.user.lastName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-medium">
                    {assignee.user.firstName} {assignee.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {assignee.user.email}
                  </p>
                </div>
              </div>
              <Badge variant="outline">{assignee.role}</Badge>
            </div>
          ))}
          {assignees.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No assignees
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssigneesModal;

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
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
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  type Role = "owner" | "admin" | "member" | "viewer";

  const roleColors: Record<Role, string> = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    member: "bg-green-100 text-green-800",
    viewer: "bg-gray-100 text-gray-800",
  };

  const getRoleColor = (role: string): string => {
    const normalizedRole = role.toLowerCase() as Role;
    return roleColors[normalizedRole] || roleColors.member;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 h-8">
          <Users className="h-3 w-3 mr-1" />
          {assignees.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Assignees</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-3">
            {assignees.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No assignees for this task
              </div>
            ) : (
              assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {assignee.user.imageUrl ? (
                        <AvatarImage
                          src={assignee.user.imageUrl}
                          alt={`${assignee.user.firstName} ${assignee.user.lastName}`}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {getInitials(
                            assignee.user.firstName,
                            assignee.user.lastName,
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="font-medium truncate">
                        {assignee.user.firstName} {assignee.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {assignee.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`capitalize ml-2 shrink-0 ${getRoleColor(assignee.role)}`}
                  >
                    {assignee.role.toLowerCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AssigneesModal;

"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

interface CustomerMessageCardProps {
  unreadCount: number;
}

const CustomerMessageCard: React.FC<CustomerMessageCardProps> = ({
  unreadCount,
}) => {
  return (
    <DialogTrigger asChild>
      <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <div className="flex flex-col">
              <span>Reply to customer</span>
              {unreadCount > 0 && (
                <span className="text-xs text-accent font-normal">
                  {unreadCount} unread messages
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Reply to customer Messages</p>
        </CardContent>
      </Card>
    </DialogTrigger>
  );
};

export default CustomerMessageCard;

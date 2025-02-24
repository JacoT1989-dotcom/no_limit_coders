import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Star, Archive, Flag } from "lucide-react";

const MessagesCard = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <span>Public Messages Received</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Public message Inbox</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Message Center</DialogTitle>
          <DialogDescription>
            Manage your incoming messages and inquiries
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground">
              <Star className="h-4 w-4" />
              <span>Important</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-accent/5">
              <Archive className="h-4 w-4" />
              <span>Archived</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-accent/5">
              <Flag className="h-4 w-4" />
              <span>Flagged</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 hover:bg-accent/5 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Project Inquiry</h3>
                <span className="text-xs text-accent">5m ago</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Hi, I am interested in discussing a potential website redesign
                project...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">John Smith</span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  New
                </span>
              </div>
            </div>

            <div className="rounded-lg border p-4 hover:bg-accent/5 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">Consultation Follow-up</h3>
                <span className="text-xs text-accent">2h ago</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Thank you for the great session yesterday. I have some
                additional questions...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Emma Wilson</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  Read
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-accent">12</p>
              <p className="text-sm text-muted-foreground">New Messages</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-accent">45</p>
              <p className="text-sm text-muted-foreground">Total Messages</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-semibold text-accent">8m</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesCard;

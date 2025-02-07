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
import { FolderPlus } from "lucide-react";

const CustomerProjectsCard = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <FolderPlus className="h-6 w-6 text-accent" />
              </div>
              <span>Customer Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Stay up to date with our project inbox
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Customer Projects Dashboard
          </DialogTitle>
          <DialogDescription>
            Manage and track all your customer projects in one place
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Active Projects</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Website Redesign</span>
                  <span className="text-sm text-accent">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Marketing Campaign</span>
                  <span className="text-sm text-accent">20%</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Project Metrics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Projects</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>In Progress</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Recent Updates</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">
                    Homepage Design Completed
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">New Project Milestone</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerProjectsCard;

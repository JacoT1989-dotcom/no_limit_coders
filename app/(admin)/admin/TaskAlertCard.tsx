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
import { Layout, Bell, BellOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const TaskAlertCard = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Layout className="h-6 w-6 text-accent" />
              </div>
              <span>New Task Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Be informed immediately after a customer assigned a task to a
              project
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Task Notifications</DialogTitle>
          <DialogDescription>
            Manage your task alerts and notification preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium">Notification Status</p>
                <p className="text-sm text-muted-foreground">
                  Alerts are currently active
                </p>
              </div>
            </div>
            <Button className="p-2 rounded-lg hover:bg-accent/5">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Recent Task Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5">
                <div>
                  <p className="font-medium">Landing Page Update</p>
                  <p className="text-sm text-muted-foreground">
                    Added by Client A
                  </p>
                  <p className="text-xs text-accent">10 minutes ago</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                  High Priority
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">Content Review</p>
                  <p className="text-sm text-muted-foreground">
                    Added by Client B
                  </p>
                  <p className="text-xs text-accent">1 hour ago</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                  Medium Priority
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Alert Settings</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-accent"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-accent"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">Priority Filters</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm">High Priority Only</span>
                  <input type="checkbox" className="accent-accent" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Include Comments</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-accent"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent/5">
              <BellOff className="h-4 w-4" />
              <span>Mute All</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground">
              <Bell className="h-4 w-4" />
              <span>Update Preferences</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAlertCard;

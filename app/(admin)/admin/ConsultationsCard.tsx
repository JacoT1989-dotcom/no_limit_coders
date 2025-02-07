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
import { Calendar } from "lucide-react";

const ConsultationsCard = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <span>Consultations Booked</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Public consultation booking Inbox
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl dark:bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upcoming Consultations</DialogTitle>
          <DialogDescription>
            View and manage your scheduled consultations
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-4">Schedules</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start p-3 rounded-lg bg-accent/5">
                  <div>
                    <p className="font-medium">Website Strategy Session</p>
                    <p className="text-sm text-muted-foreground">
                      Sarah Johnson
                    </p>
                    <p className="text-sm text-accent">10:00 AM - 11:00 AM</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Confirmed
                  </span>
                </div>
                <div className="flex justify-between items-start p-3 rounded-lg bg-accent/5">
                  <div>
                    <p className="font-medium">Brand Identity Review</p>
                    <p className="text-sm text-muted-foreground">
                      Michael Chen
                    </p>
                    <p className="text-sm text-accent">2:00 PM - 3:00 PM</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bookings</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Week</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-sm text-accent hover:text-accent/80">
                  Send Reminder
                </button>
                <button className="w-full text-sm text-accent hover:text-accent/80">
                  Reschedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationsCard;

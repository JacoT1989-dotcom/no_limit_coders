"use client";

import React, { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScheduleMeetingModalProps, ScheduleMeetingFormValues } from "./types";
import { scheduleMeeting } from "./scheduleMeetingActions";
import { toast } from "sonner";

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  children,
  projectId,
  onSuccess,
  defaultSubject = "",
  defaultParticipants = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ScheduleMeetingFormValues>({
    subject: defaultSubject,
    date: new Date().toISOString().split("T")[0],
    time: "",
    participants: defaultParticipants,
    projectId,
  });

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of ["00", "30"]) {
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
        slots.push({ value: time, display: displayTime });
      }
    }
    return slots;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await scheduleMeeting(formData);

      if (result.error) {
        toast.error("Failed to schedule meeting", {
          description: result.error,
        });
      } else if (result.success) {
        toast.success("Meeting scheduled successfully", {
          description: "Your meeting has been added to the calendar.",
        });
        setIsOpen(false);

        // Handle success callback - using optional chaining to avoid the TypeScript error
        // Since meetingId is not guaranteed in the return type
        if (onSuccess) {
          // We're using type assertion here since we know this is a valid pattern in our app
          // even though TypeScript doesn't know about the meetingId property
          const meetingId = (result as any).meetingId || "";
          onSuccess(meetingId);
        }

        // Reset form
        setFormData({
          subject: "",
          date: new Date().toISOString().split("T")[0],
          time: "",
          participants: "",
          projectId,
        });
      }
    } catch (error) {
      toast.error("Error scheduling meeting", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.subject.trim() !== "" &&
    formData.date !== "" &&
    formData.time !== "" &&
    formData.participants.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
          <DialogDescription>
            Choose a date, time, and add participants for your meeting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Meeting Subject</Label>
              <div className="relative">
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Enter meeting subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full pl-10"
                />
                <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10"
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <div className="relative">
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full h-10 pl-10 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Select meeting time"
                >
                  <option value="">Select time</option>
                  {generateTimeSlots().map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.display}
                    </option>
                  ))}
                </select>
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Participants</Label>
              <div className="relative">
                <Input
                  id="participants"
                  name="participants"
                  placeholder="Enter email addresses (comma-separated)"
                  value={formData.participants}
                  onChange={handleChange}
                  className="w-full pl-10"
                />
                <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleMeetingModal;

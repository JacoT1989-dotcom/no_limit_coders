import { z } from "zod";
import { scheduleMeetingSchema } from "./validations";

// Form values type derived from the validation schema
export type ScheduleMeetingFormValues = z.infer<typeof scheduleMeetingSchema>;

// Response type for scheduling actions
export interface ScheduleMeetingResponse {
  success?: boolean;
  error?: string;
  meetingId?: string;
}

// Type for meeting data returned from the server
export interface MeetingData {
  id: string;
  subject: string;
  date: Date;
  time: string;
  participants: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// Props interface for the ScheduleMeetingModal component
export interface ScheduleMeetingModalProps {
  children: React.ReactNode;
  projectId?: string;
  onSuccess?: (meetingId: string) => void;
  defaultSubject?: string;
  defaultParticipants?: string;
}

// Time slot interface for the time picker
export interface TimeSlot {
  value: string;
  display: string;
}

export type BookingFormValues = {
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  package: "NONE" | "STARTUPTEAM" | "PROFESSIONALTEAM" | "ENTERPRISE";
  message: string;
  userId?: string;
};

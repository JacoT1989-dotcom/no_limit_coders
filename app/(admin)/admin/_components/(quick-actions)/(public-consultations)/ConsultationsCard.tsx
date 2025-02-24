"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { format, differenceInDays, differenceInWeeks } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBookingMessages } from "./get-public-bookings-actions";
import { countries } from "@/app/(public)/_components/(section-1)/types";

// Define the booking type based on the returned data
type Booking = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  package: string;
  message: string;
  createdAt: string | Date;
};

const ConsultationsCard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("recent");

  // Function to load booking data
  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await getBookingMessages();
      if (result.error) {
        setError(result.error);
      } else {
        setBookings(result.data);
      }
    } catch (err) {
      setError("Failed to load consultations. Please try again.");
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load bookings when dialog is opened
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      loadBookings();
    }
  };

  // Filter bookings by recency
  const getFilteredBookings = (filter: string) => {
    const now = new Date();

    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt);
      const daysDiff = differenceInDays(now, bookingDate);

      switch (filter) {
        case "recent":
          // Less than 1 week old
          return daysDiff < 7;
        case "week":
          // Between 1 and 2 weeks old
          return daysDiff >= 7 && daysDiff < 14;
        case "older":
          // 2 weeks or older
          return daysDiff >= 14;
        default:
          return true;
      }
    });
  };

  // Get counts for tabs
  const getTabCounts = () => {
    const recentCount = getFilteredBookings("recent").length;
    const weekCount = getFilteredBookings("week").length;
    const olderCount = getFilteredBookings("older").length;

    return { recentCount, weekCount, olderCount };
  };

  const { recentCount, weekCount, olderCount } = getTabCounts();

  return (
    <Dialog onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <span>Public Consultations Booked</span>
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
          <DialogTitle className="text-2xl">Consultation Bookings</DialogTitle>
          <DialogDescription>
            View and manage consultation bookings from clients
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={loadBookings}
              className="mt-4 px-4 py-2 bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs
              defaultValue="recent"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 mb-4 [&>[data-state=active]]:dark:bg-red-600 [&>[data-state=active]]:dark:text-white">
                <TabsTrigger value="recent" className="relative px-2">
                  Most Recent
                  {recentCount > 0 && (
                    <span className="inline-flex ml-1.5 bg-accent dark:bg-white dark:text-red-600 text-white text-xs rounded-full w-5 h-5 items-center justify-center">
                      {recentCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="week" className="relative px-2">
                  Past Week
                  {weekCount > 0 && (
                    <span className="inline-flex ml-1.5 bg-accent dark:bg-white dark:text-red-600 text-white text-xs rounded-full w-5 h-5 items-center justify-center">
                      {weekCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="older" className="relative px-2">
                  Older
                  {olderCount > 0 && (
                    <span className="inline-flex ml-1.5 bg-accent dark:bg-white dark:text-red-600 text-white text-xs rounded-full w-5 h-5 items-center justify-center">
                      {olderCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                <BookingList
                  bookings={getFilteredBookings("recent")}
                  title="Most Recent Bookings"
                  emptyMessage="No recent booking requests found."
                />
              </TabsContent>

              <TabsContent value="week">
                <BookingList
                  bookings={getFilteredBookings("week")}
                  title="Bookings From Last Week"
                  emptyMessage="No bookings from last week."
                />
              </TabsContent>

              <TabsContent value="older">
                <BookingList
                  bookings={getFilteredBookings("older")}
                  title="Older Bookings"
                  emptyMessage="No older booking requests found."
                />
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Bookings</span>
                    <span className="font-medium">{bookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professional Team</span>
                    <span className="font-medium">
                      {
                        bookings.filter((b) => b.package === "PROFESSIONALTEAM")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Startup Team</span>
                    <span className="font-medium">
                      {
                        bookings.filter((b) => b.package === "STARTUPTEAM")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enterprise</span>
                    <span className="font-medium">
                      {
                        bookings.filter((b) => b.package === "ENTERPRISE")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">None</span>
                    <span className="font-medium">
                      {bookings.filter((b) => b.package === "NONE").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={loadBookings}
                    className="w-full text-sm text-accent hover:text-accent/80"
                  >
                    Refresh Data
                  </button>
                  <button className="w-full text-sm text-accent hover:text-accent/80">
                    Export to CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// BookingList component for each tab
type BookingListProps = {
  bookings: Booking[];
  title: string;
  emptyMessage: string;
};

const BookingList = ({ bookings, title, emptyMessage }: BookingListProps) => {
  // Function to get full country name from country code
  const getCountryName = (countryCode: string): string => {
    const country = countries.find(
      (c) => c.value === countryCode.toLowerCase(),
    );
    return country ? country.label : countryCode;
  };

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {emptyMessage}
          </p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex justify-between items-start p-3 rounded-lg bg-accent/5"
            >
              <div>
                <p className="font-medium">{booking.fullName}</p>
                <p className="text-sm text-muted-foreground">{booking.email}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.mobile}
                </p>
                <p className="text-sm text-accent">
                  {format(new Date(booking.createdAt), "PPP")}
                </p>
                <p className="text-sm mt-2 line-clamp-2">{booking.message}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 mb-2">
                  {booking.package}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getCountryName(booking.country)} (
                  {booking.country.toUpperCase()})
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultationsCard;

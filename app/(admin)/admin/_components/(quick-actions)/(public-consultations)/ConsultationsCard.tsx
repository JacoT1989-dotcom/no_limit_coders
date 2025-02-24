"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Loader2,
  Star,
  Archive,
  Flag,
  CheckCircle,
  Clock,
} from "lucide-react";
import { getBookingMessages } from "./get-public-bookings-actions";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [filterType, setFilterType] = useState<
    "all" | "priority" | "completed" | "pending"
  >("all");

  // State for booking statuses
  const [priorityBookings, setPriorityBookings] = useState<Set<string>>(
    new Set(),
  );
  const [completedBookings, setCompletedBookings] = useState<Set<string>>(
    new Set(),
  );
  const [pendingBookings, setPendingBookings] = useState<Set<string>>(
    new Set(),
  );
  const [viewedBookings, setViewedBookings] = useState<Set<string>>(new Set());

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

  // Function to get full country name from country code
  const getCountryName = (countryCode: string): string => {
    const country = countries.find(
      (c) => c.value === countryCode.toLowerCase(),
    );
    return country ? country.label : countryCode;
  };

  // Filter bookings by recency
  const getFilteredBookings = (filter: string) => {
    const now = new Date();
    let filtered = bookings;

    // First apply time filter
    filtered = filtered.filter((booking) => {
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

    // Then apply category filter
    if (filterType !== "all") {
      filtered = filtered.filter((booking) => {
        if (filterType === "priority") return priorityBookings.has(booking.id);
        if (filterType === "completed")
          return completedBookings.has(booking.id);
        if (filterType === "pending") return pendingBookings.has(booking.id);
        return true;
      });
    }

    return filtered;
  };

  // Toggle booking flags
  const toggleBookingFlag = (
    id: string,
    flag: "priority" | "completed" | "pending" | "viewed",
  ) => {
    if (flag === "priority") {
      setPriorityBookings((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else if (flag === "completed") {
      setCompletedBookings((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
          // Remove from pending when marked as completed
          setPendingBookings((prev) => {
            const pendingSet = new Set(prev);
            pendingSet.delete(id);
            return pendingSet;
          });
        }
        return newSet;
      });
    } else if (flag === "pending") {
      setPendingBookings((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
          // Remove from completed when marked as pending
          setCompletedBookings((prev) => {
            const completedSet = new Set(prev);
            completedSet.delete(id);
            return completedSet;
          });
        }
        return newSet;
      });
    } else if (flag === "viewed") {
      setViewedBookings((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    }
  };

  // Get counts
  const getTabCounts = () => {
    const recentCount = getFilteredBookings("recent").length;
    const weekCount = getFilteredBookings("week").length;
    const olderCount = getFilteredBookings("older").length;

    return { recentCount, weekCount, olderCount };
  };

  const { recentCount, weekCount, olderCount } = getTabCounts();
  const filteredBookings = getFilteredBookings(activeTab);
  const newCount = bookings.filter((b) => !viewedBookings.has(b.id)).length;

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
            <div className="flex gap-4 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterType("all")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "all"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <span>All</span>
              </button>
              <button
                onClick={() => setFilterType("priority")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "priority"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Priority</span>
              </button>
              <button
                onClick={() => setFilterType("completed")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "completed"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </button>
              <button
                onClick={() => setFilterType("pending")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "pending"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Pending</span>
              </button>
            </div>

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

              <TabsContent value={activeTab}>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {filteredBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No bookings found.
                    </p>
                  ) : (
                    filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg border p-4 hover:bg-accent/5 cursor-pointer"
                        onClick={() => toggleBookingFlag(booking.id, "viewed")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">
                            Booking from {booking.fullName}
                          </h3>
                          <span className="text-xs text-accent">
                            {formatDistanceToNow(new Date(booking.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {booking.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium">
                              {booking.email}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {booking.package}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {getCountryName(booking.country)} (
                              {booking.country.toUpperCase()})
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {priorityBookings.has(booking.id) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                Priority
                              </span>
                            )}
                            {completedBookings.has(booking.id) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                Completed
                              </span>
                            )}
                            {pendingBookings.has(booking.id) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                Pending
                              </span>
                            )}
                            {!viewedBookings.has(booking.id) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookingFlag(booking.id, "priority");
                            }}
                            className={`p-1 rounded-full ${priorityBookings.has(booking.id) ? "bg-yellow-100 text-yellow-700" : "hover:bg-accent/10"}`}
                            title="Mark as Priority"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookingFlag(booking.id, "completed");
                            }}
                            className={`p-1 rounded-full ${completedBookings.has(booking.id) ? "bg-green-100 text-green-700" : "hover:bg-accent/10"}`}
                            title="Mark as Completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookingFlag(booking.id, "pending");
                            }}
                            className={`p-1 rounded-full ${pendingBookings.has(booking.id) ? "bg-blue-100 text-blue-700" : "hover:bg-accent/10"}`}
                            title="Mark as Pending"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                    <span className="text-sm">New</span>
                    <span className="font-medium">{newCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Priority</span>
                    <span className="font-medium">{priorityBookings.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium">
                      {completedBookings.size}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium">{pendingBookings.size}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Package Statistics</h3>
                <div className="space-y-2">
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
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={loadBookings}
                className="px-4 py-2 bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors"
              >
                Refresh Data
              </button>
              <button className="px-4 py-2 bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors">
                Export to CSV
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationsCard;

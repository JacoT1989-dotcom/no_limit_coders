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
import { FileText, Star, Archive, Flag, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMessages } from "./get-public-contact-us-actions";
import { countries } from "@/app/(public)/_components/(section-1)/types";
import { Button } from "@/components/ui/button";

// Define the message type based on the returned data
type Message = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  message: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const MessagesCard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("recent");
  const [filterType, setFilterType] = useState<
    "all" | "important" | "archived" | "flagged"
  >("all");

  // Flags to mark messages
  const [importantMessages, setImportantMessages] = useState<Set<string>>(
    new Set(),
  );
  const [archivedMessages, setArchivedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [flaggedMessages, setFlaggedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());

  // Function to load message data
  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await getMessages();
      if (result.error) {
        setError(result.error);
      } else {
        setMessages(result.data);
      }
    } catch (err) {
      setError("Failed to load messages. Please try again.");
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages when dialog is opened
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      loadMessages();
    }
  };

  // Function to get full country name from country code
  const getCountryName = (countryCode: string): string => {
    const country = countries.find(
      (c) => c.value === countryCode.toLowerCase(),
    );
    return country ? country.label : countryCode;
  };

  // Filter messages by recency
  const getFilteredMessages = (filter: string) => {
    const now = new Date();
    let filtered = messages;

    // First apply time filter
    filtered = filtered.filter((message) => {
      const messageDate = new Date(message.createdAt);
      const daysDiff = Math.floor(
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
      );

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
      filtered = filtered.filter((message) => {
        if (filterType === "important")
          return importantMessages.has(message.id);
        if (filterType === "archived") return archivedMessages.has(message.id);
        if (filterType === "flagged") return flaggedMessages.has(message.id);
        return true;
      });
    }

    return filtered;
  };

  // Toggle message flags
  const toggleMessageFlag = (
    id: string,
    flag: "important" | "archived" | "flagged" | "read",
  ) => {
    if (flag === "important") {
      setImportantMessages((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else if (flag === "archived") {
      setArchivedMessages((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else if (flag === "flagged") {
      setFlaggedMessages((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else if (flag === "read") {
      setReadMessages((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    }
  };

  // Get counts
  const filteredMessages = getFilteredMessages(activeTab);
  const recentCount = getFilteredMessages("recent").length;
  const weekCount = getFilteredMessages("week").length;
  const olderCount = getFilteredMessages("older").length;
  const newCount = messages.filter((m) => !readMessages.has(m.id)).length;

  return (
    <Dialog onOpenChange={handleDialogOpen}>
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

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={loadMessages}
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
                onClick={() => setFilterType("important")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "important"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <Star className="h-4 w-4" />
                <span>Important</span>
              </button>
              <button
                onClick={() => setFilterType("archived")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "archived"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <Archive className="h-4 w-4" />
                <span>Archived</span>
              </button>
              <button
                onClick={() => setFilterType("flagged")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  filterType === "flagged"
                    ? "bg-accent text-accent-foreground"
                    : "border hover:bg-accent/5"
                }`}
              >
                <Flag className="h-4 w-4" />
                <span>Flagged</span>
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
                  {filteredMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No messages found.
                    </p>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className="rounded-lg border p-4 hover:bg-accent/5 cursor-pointer"
                        onClick={() => toggleMessageFlag(message.id, "read")}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">
                            Message from {message.fullName}
                          </h3>
                          <span className="text-xs text-accent">
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {message.message}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium">
                              {message.email}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {getCountryName(message.country)} (
                              {message.country.toUpperCase()})
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {importantMessages.has(message.id) && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                                Important
                              </span>
                            )}
                            {!readMessages.has(message.id) ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                New
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessageFlag(message.id, "important");
                            }}
                            className={`p-1 rounded-full ${importantMessages.has(message.id) ? "bg-yellow-100 text-yellow-700" : "hover:bg-accent/10"}`}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessageFlag(message.id, "archived");
                            }}
                            className={`p-1 rounded-full ${archivedMessages.has(message.id) ? "bg-purple-100 text-purple-700" : "hover:bg-accent/10"}`}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMessageFlag(message.id, "flagged");
                            }}
                            className={`p-1 rounded-full ${flaggedMessages.has(message.id) ? "bg-red-100 text-red-700" : "hover:bg-accent/10"}`}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold text-accent">{newCount}</p>
                <p className="text-sm text-muted-foreground">New Messages</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold text-accent">
                  {messages.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Messages</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-semibold text-accent">
                  {importantMessages.size}
                </p>
                <p className="text-sm text-muted-foreground">Important</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessagesCard;

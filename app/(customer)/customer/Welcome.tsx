"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  FileText,
  FolderPlus,
  Layout,
  Sparkles,
  ChevronRight,
  Quote,
  RefreshCw,
  ArrowRight,
  Bell,
  Clock,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "../SessionProvider";
import CreateProjectDialog from "./_components/(quick-actions)/(create_project)/CreateProjectDialog";
import ScheduleMeetingModal from "./_components/(quick-actions)/(schedule_meeting)/ScheduleMeetingModal";
import MessageTechTeamModal from "./_components/(quick-actions)/(message_tech_team)/MessageTechTeamModal";
import CustomerMessageCard from "./_components/(quick-actions)/(my_messages)/CustomerMessageCard";
import { InspirationQuote, inspirationQuotes } from "./inspirationalQuotes";

// Define interface for user data structure
interface User {
  id: string;
  displayName: string;
  // Add other user properties as needed
}

const WelcomePage = () => {
  const { user } = useSession() as { user: User };
  const displayName = user.displayName;

  // State for current inspiration quote
  const [inspiration, setInspiration] = useState<InspirationQuote>({
    text: "",
    author: "",
  });

  // Function to pick a random inspiration, wrapped in useCallback
  const getRandomInspiration = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * inspirationQuotes.length);
    setInspiration(inspirationQuotes[randomIndex]);
  }, []);

  // Set a random inspiration on component mount
  useEffect(() => {
    getRandomInspiration();
  }, [getRandomInspiration]);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-16 max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section - With Cloud Animation */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900 to-red-400 border border-red-500/20 shadow-xl slide-up hero-animation">
        {/* Cloud animation layers - multiple clouds from both directions */}
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="cloud cloud4"></div>
        <div className="cloud cloud5"></div>
        <div className="cloud cloud6"></div>

        {/* Content */}
        <div className="relative z-10 px-8 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm fade-in">
              <Clock className="mr-1 h-3 w-3" /> {getGreeting()}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white fade-in delay-1">
              Welcome back, {displayName}
            </h1>
            <p className="text-lg text-white/80 max-w-lg fade-in delay-2">
              Your personalized workspace for creating, collaborating, and
              bringing your vision to life.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 blur-2xl shimmer"></div>
              <Sparkles className="h-40 w-40 text-white/40 relative z-10" />
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </section>

      {/* Quick Actions - Modernized */}
      <section className="space-y-8 slide-up delay-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Quick Actions
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CreateProjectDialog customerId={user.id}>
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift">
              <div className="absolute top-0 left-0 h-1 w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium text-gray-800 dark:text-gray-200">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mr-3">
                    <FolderPlus className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  Create Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Launch a new initiative with our team
                </p>
                <div className="mt-4 flex justify-end">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CreateProjectDialog>

          <ScheduleMeetingModal>
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift">
              <div className="absolute top-0 left-0 h-1 w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium text-gray-800 dark:text-gray-200">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mr-3">
                    <Calendar className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  Schedule Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Book time with your project team
                </p>
                <div className="mt-4 flex justify-end">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScheduleMeetingModal>

          <CustomerMessageCard />

          <MessageTechTeamModal>
            <Card className="group relative overflow-hidden border-0 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover-lift">
              <div className="absolute top-0 left-0 h-1 w-0 bg-red-500 group-hover:w-full transition-all duration-300" />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg font-medium text-gray-800 dark:text-gray-200">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-2 mr-3">
                    <Layout className="h-5 w-5 text-red-500 dark:text-red-400" />
                  </div>
                  Create Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Start a discussion topic with admin
                </p>
                <div className="mt-4 flex justify-end">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </MessageTechTeamModal>
        </div>
      </section>

      {/* Daily Inspiration Section - Modernized */}
      <section className="space-y-8 slide-up delay-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            Daily Inspiration
          </h2>
          <button
            onClick={getRandomInspiration}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-4 py-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            New Quote
          </button>
        </div>

        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-red-400 dark:bg-red-600"></div>
                <h3 className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                  Quote of the Day
                </h3>
              </div>

              <div className="relative">
                <Quote className="h-12 w-12 text-gray-200 dark:text-gray-700 absolute -top-2 -left-2" />
                <div className="pl-6">
                  <p className="text-xl sm:text-2xl font-serif leading-relaxed mb-6 italic text-gray-800 dark:text-gray-200 fade-in">
                    &quot;{inspiration.text}&quot;
                  </p>
                  <p className="text-right text-lg font-medium text-gray-600 dark:text-gray-400 fade-in delay-1">
                    — {inspiration.author}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default WelcomePage;
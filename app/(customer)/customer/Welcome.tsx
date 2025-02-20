"use client";

import React from "react";
import {
  Calendar,
  FileText,
  FolderPlus,
  Layout,
  MessageSquare,
  Sparkles,
  LineChart,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "../SessionProvider";
import CreateProjectDialog from "./_components/(quick-actions)/(create_project)/CreateProjectDialog";
import ScheduleMeetingModal from "./_components/(quick-actions)/(schedule_meeting)/ScheduleMeetingModal";
import MessageTechTeamModal from "./_components/(quick-actions)/(message_tech_team)/MessageTechTeamModal";
import ViewMessagesModal from "./_components/(quick-actions)/(my_messages)/ViewMessagesModal";

// Define interface for user data structure
interface User {
  id: string;
  displayName: string;
  // Add other user properties as needed
}

const WelcomePage = () => {
  const { user } = useSession() as { user: User };
  const displayName = user.displayName;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent to-accent/80 p-8 text-accent-foreground">
        <div className="relative z-10">
          <div className="max-w-xl space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Welcome to your dashboard, {displayName}
            </h1>
            <p className="text-xl opacity-90">
              Your personalized space to create, collaborate, and bring your
              vision to life.
            </p>
          </div>
        </div>
        <Sparkles className="absolute right-8 top-8 h-32 w-32 opacity-20" />
      </section>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CreateProjectDialog customerId={user.id}>
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <FolderPlus className="h-6 w-6 text-accent" />
                  </div>
                  <span>Create Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Launch a new initiative with our team
                </p>
              </CardContent>
            </Card>
          </CreateProjectDialog>

          <ScheduleMeetingModal>
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <Calendar className="h-6 w-6 text-accent" />
                  </div>
                  <span>Schedule Meeting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Book time with your project team
                </p>
              </CardContent>
            </Card>
          </ScheduleMeetingModal>

          <ViewMessagesModal>
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <span>View My Messages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View your messages by clicking this block
                </p>
              </CardContent>
            </Card>
          </ViewMessagesModal>

          <MessageTechTeamModal>
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-accent/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <Layout className="h-6 w-6 text-accent" />
                  </div>
                  <span>Message Tech Team</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instant Message allows you to have response in a flash
                </p>
              </CardContent>
            </Card>
          </MessageTechTeamModal>
        </div>
      </section>

      {/* Projects and Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Active Projects Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Projects</h2>
            <button className="flex items-center text-accent hover:text-accent/80 text-sm">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            <Card className="group hover:bg-accent/5 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                    <div>
                      <h3 className="font-medium">Website Redesign</h3>
                      <p className="text-sm text-muted-foreground">
                        Phase 2 in progress
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-accent">
                    85% Complete
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:bg-accent/5 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-3 w-3 rounded-full bg-accent/70" />
                    <div>
                      <h3 className="font-medium">Marketing Campaign</h3>
                      <p className="text-sm text-muted-foreground">
                        Planning stage
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-accent">
                    20% Complete
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            <button className="flex items-center text-accent hover:text-accent/80 text-sm">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 rounded-full bg-accent/10 p-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">New Design Feedback</p>
                    <p className="text-sm text-muted-foreground">
                      Sarah left a comment on the homepage design
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      2 hours ago
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 rounded-full bg-accent/10 p-2">
                    <LineChart className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics Report</p>
                    <p className="text-sm text-muted-foreground">
                      Monthly performance metrics updated
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Yesterday
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default WelcomePage;

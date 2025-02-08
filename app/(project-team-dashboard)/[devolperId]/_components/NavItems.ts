// app/[developerId]/developer/_components/NavItems.ts
import { Settings, Users, FileText } from "lucide-react";

export type NavItem = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  links?: {
    name: string;
    href: string;
  }[];
};

// Get developerId from URL
const path = window.location.pathname;
const developerId = path.split("/")[1];

export const navigation: NavItem[] = [
  {
    label: "Tasks",
    icon: FileText,
    links: [
      {
        name: "Task Table",
        href: `/${developerId}/developer/customer-tasks/customer-task-table`,
      },
      {
        name: "Task Kanban",
        href: `/${developerId}/developer/customer-tasks/task-kanban-progress`,
      },
      {
        name: "Task Calendar",
        href: `/${developerId}/developer/customer-tasks/task-calendar-update`,
      },
    ],
  },
  {
    label: "Chat & Feeds",
    icon: FileText,
    links: [
      {
        name: "Customer Messages",
        href: `/${developerId}/developer/customer-messages`,
      },
      {
        name: "Tech Team Feed",
        href: `/${developerId}/developer/tech-team-feed`,
      },
      {
        name: "Upcoming Meetings",
        href: `/${developerId}/developer/schedule-meeting`,
      },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    links: [
      {
        name: "General",
        href: `/${developerId}/developer/settings/general`,
      },
      {
        name: "Security",
        href: `/${developerId}/developer/settings/security`,
      },
      {
        name: "Preferences",
        href: `/${developerId}/developer/settings/preferences`,
      },
    ],
  },
];

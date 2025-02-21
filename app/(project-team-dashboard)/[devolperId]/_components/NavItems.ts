"use client";

import { Settings, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export type NavItem = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  links?: {
    name: string;
    href: string;
  }[];
};

// This is a placeholder that will be replaced on the client
let developerId = "placeholder";

// Only run this in client environment
if (typeof window !== "undefined") {
  const path = window.location.pathname;
  developerId = path.split("/")[1];
}

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

// Export a hook to get navigation with correct links after hydration
export function useCorrectNavigation() {
  const [nav, setNav] = useState(navigation);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const id = path.split("/")[1];

      // Only update if we have a real ID that's different from placeholder
      if (id && id !== "placeholder") {
        const updatedNav = navigation.map((item) => ({
          ...item,
          links: item.links?.map((link) => ({
            ...link,
            href: link.href.replace("placeholder", id),
          })),
        }));

        setNav(updatedNav);
      }
    }
  }, []);

  return nav;
}

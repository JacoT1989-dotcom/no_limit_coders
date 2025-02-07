// types/navigation.ts
export type NavItem = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  links?: {
    name: string;
    href: string;
  }[];
};

// config/navigation.ts
import { Settings, Users, FileText } from "lucide-react";

export const navigation: NavItem[] = [
  {
    label: "Tasks",
    icon: Users,
    href: "/customer/tasks",
  },
  {
    label: "Chat & Feeds",
    icon: FileText,
    links: [
      { name: "Customer Messages", href: "/admin/customer-messages" },
      { name: "Tech Team Feed", href: "/admin/tech-team-feed" },
      { name: "Upcoming Meetings", href: "/admin/schedule-meeting" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    links: [
      { name: "General", href: "/admin/settings/general" },
      { name: "Security", href: "/admin/settings/security" },
      { name: "Preferences", href: "/admin/settings/preferences" },
    ],
  },
];

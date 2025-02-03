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
import {
  Settings,
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";

export const navigation: NavItem[] = [
  {
    label: "Projects",
    icon: ShoppingCart,
    links: [
      { name: "Create", href: "/customer/products/create" },
      { name: "Update", href: "/customer/products/update" },
    ],
  },
  {
    label: "Tasks",
    icon: Users,
    href: "/customers/tasks",
  },
  {
    label: "Chat & Feeds",
    icon: FileText,
    links: [
      { name: "Notify tech Team", href: "/customers/notify-tech-team" },
      { name: "Tech Team Feed", href: "/customers/tech-team-feed" },
      { name: "Upcoming Meetings", href: "/customers/schedule-meeting" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    links: [
      { name: "General", href: "/customers/settings/general" },
      { name: "Security", href: "/customers/settings/security" },
      { name: "Preferences", href: "/customers/settings/preferences" },
    ],
  },
];

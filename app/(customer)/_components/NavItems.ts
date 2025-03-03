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
    label: "Tasks",
    icon: Users,
    href: "/customer/tasks",
  },
  {
    label: "Social Feeds",
    icon: FileText,
    links: [
      { name: "Latest News", href: "/customer/notify-tech-team" },
      { name: "Tech Team Feed", href: "/customer/tech-team-feed" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    links: [
      { name: "General", href: "/customer/settings/general" },
      { name: "Security", href: "/customer/settings/security" },
    ],
  },
];

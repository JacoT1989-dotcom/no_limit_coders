import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

// Enum matching your Prisma schema
enum UserRole {
  USER = "USER",
  CUSTOMER = "CUSTOMER",
  PROCUSTOMER = "PROCUSTOMER",
  EDITOR = "EDITOR",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
  DEVELOPER = "DEVELOPER",
}

type StaticRoute = string;
type DynamicRoute = (developerId: string) => string;

type RoleRoutes = {
  [UserRole.USER]: StaticRoute;
  [UserRole.CUSTOMER]: StaticRoute;
  [UserRole.PROCUSTOMER]: StaticRoute;
  [UserRole.EDITOR]: StaticRoute;
  [UserRole.ADMIN]: StaticRoute;
  [UserRole.SUPERADMIN]: StaticRoute;
  [UserRole.DEVELOPER]: DynamicRoute;
};

// Define role-based routing
const roleRoutes: RoleRoutes = {
  [UserRole.USER]: "/register-success",
  [UserRole.CUSTOMER]: "/customer",
  [UserRole.PROCUSTOMER]: "/pro",
  [UserRole.EDITOR]: "/editor",
  [UserRole.ADMIN]: "/admin",
  [UserRole.SUPERADMIN]: "/super-admin",
  [UserRole.DEVELOPER]: (developerId: string) => `/${developerId}/developer`,
};

function toUserRole(role: string): UserRole | undefined {
  return Object.values(UserRole).includes(role as UserRole)
    ? (role as UserRole)
    : undefined;
}

export default async function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  if (user) {
    const userRole = toUserRole(user.role);

    if (userRole) {
      if (userRole === UserRole.DEVELOPER) {
        redirect(roleRoutes[userRole](user.id));
      } else if (userRole in roleRoutes) {
        const redirectPath = roleRoutes[userRole];
        if (typeof redirectPath === "string") {
          redirect(redirectPath);
        }
      }
    } else {
      console.warn(`Unrecognized user role: ${user.role}`);
      redirect("/");
    }
  }

  return (
    <>
      <Toaster />
      {children}
    </>
  );
}

import { redirect } from "next/navigation";
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { UserData } from "./types";
import UpdateUserForm from "./UpdateUserForm";

async function getUserData(): Promise<UserData | null> {
  const { user } = await validateRequest();

  if (!user) {
    return null;
  }

  // Check if user has customer role
  if (user.role !== UserRole.CUSTOMER && user.role !== UserRole.PROCUSTOMER) {
    return null;
  }

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      displayName: true,
      email: true,
      phoneNumber: true,
      streetAddress: true,
      suburb: true,
      townCity: true,
      postcode: true,
      country: true,
      avatarUrl: true,
      backgroundUrl: true,
    },
  });

  return userData as UserData;
}

export default async function ProfilePage() {
  const userData = await getUserData();

  if (!userData) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen w-full bg-background pb-20">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-accent/20 blur-3xl"></div>
        <div className="absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-accent/20 blur-3xl"></div>
      </div>

      {/* Cloud animations */}
      <div className="hero-animation">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="cloud cloud4"></div>
      </div>

      {/* Main content */}
      <div className="container relative mx-auto">
        <UpdateUserForm initialUserData={userData} />
      </div>
    </div>
  );
}

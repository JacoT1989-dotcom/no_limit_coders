"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Session as LuciaSession } from "lucia";
import { getCurrentUserData } from "./customer/settings/general/actions";

// Define the UserRole enum to match Prisma
export type UserRole =
  | "USER"
  | "CUSTOMER"
  | "PROCUSTOMER"
  | "EDITOR"
  | "ADMIN"
  | "DEVELOPER"
  | "SUPERADMIN";

// Define the SessionUser type with only the safe fields we want to expose
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  postcode: string;
  country: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  role: UserRole;
}

// Extend Lucia's Session type with our user type
export interface SessionWithUser extends LuciaSession {
  user: SessionUser;
}

// Define the context interface
interface SessionContext {
  user: SessionUser;
  session: SessionWithUser;
  refreshUserData: () => Promise<void>;
  isRefreshing: boolean;
}

const SessionContext = createContext<SessionContext | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: {
    user: SessionUser;
    session: LuciaSession;
  };
}) {
  const [userData, setUserData] = useState<SessionUser>(value.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const freshUserData = await getCurrentUserData();
      if (freshUserData) {
        setUserData({
          ...freshUserData,
          role: value.user.role, // Preserve the role from the original session
        } as SessionUser);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [value.user.role]);

  // Transform the value to match our SessionContext type
  const sessionValue: SessionContext = {
    user: userData,
    session: {
      ...value.session,
      user: userData,
    },
    refreshUserData,
    isRefreshing,
  };

  return (
    <SessionContext.Provider value={sessionValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

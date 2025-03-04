"use client";

import { useState } from "react";
import { UserData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  UserRound,
  MapPin,
  Camera,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserData } from "./actions";

// Import sections
import { PersonalInfoSection } from "./PersonalInfoSection";
import { AddressSection } from "./AddressSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { PasswordSection } from "./PasswordSection";
import { useSession } from "@/app/(customer)/SessionProvider";

interface UpdateUserFormProps {
  initialUserData: UserData;
}

export default function UpdateUserForm({
  initialUserData,
}: UpdateUserFormProps) {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [activeTab, setActiveTab] = useState("personal");
  const [refreshing, setRefreshing] = useState(false);
  const { refreshUserData } = useSession();

  // Event handler for when any section is successfully updated
  const handleUpdateSuccess = async () => {
    setRefreshing(true);
    try {
      const refreshedData = await getCurrentUserData();
      if (refreshedData) {
        setUserData(refreshedData as UserData);

        // Also refresh the session context to update navbar
        await refreshUserData();
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-accent">
            Your Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your personal information and profile settings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdateSuccess}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Separator className="my-6" />

      <Tabs
        defaultValue="personal"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-xl grid-cols-4 mb-8">
            <TabsTrigger
              value="personal"
              className="flex flex-col gap-1 h-16 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <UserRound className="h-4 w-4" />
              <span className="text-xs">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="address"
              className="flex flex-col gap-1 h-16 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Address</span>
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="flex flex-col gap-1 h-16 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <Camera className="h-4 w-4" />
              <span className="text-xs">Images</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex flex-col gap-1 h-16 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              <KeyRound className="h-4 w-4" />
              <span className="text-xs">Password</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6 space-y-8">
          <TabsContent value="personal" className="mt-0">
            <PersonalInfoSection
              userData={userData}
              onSuccess={handleUpdateSuccess}
            />
          </TabsContent>

          <TabsContent value="address" className="mt-0">
            <AddressSection
              userData={userData}
              onSuccess={handleUpdateSuccess}
            />
          </TabsContent>

          <TabsContent value="images" className="mt-0">
            <ImageUploadSection
              userData={userData}
              onSuccess={handleUpdateSuccess}
            />
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            <PasswordSection onSuccess={handleUpdateSuccess} />
          </TabsContent>
        </div>
      </Tabs>

      <div className="mt-8 rounded-lg border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <p className="font-medium">Your information is secure</p>
        </div>
        <p className="mt-2">
          We take data protection seriously. Your personal information is stored
          securely and only accessible to you.
        </p>
      </div>
    </div>
  );
}

import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import SessionProvider from "./SessionProvider";
import { Toaster } from "react-hot-toast";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user || session.user.role !== UserRole.CUSTOMER) {
    redirect("/login");
  }

  return (
    <SessionProvider value={session}>
      <Toaster />
      <div className="flex min-h-screen flex-col">
        <div className="bg-slate-400"></div>
        <div className="flex w-full grow">
          <main className="flex-grow">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}

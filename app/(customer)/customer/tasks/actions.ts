"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectOption } from "./types";

export async function getCustomerProjects(): Promise<{
  projects?: ProjectOption[];
  error?: string;
}> {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");
    if (user.role !== "CUSTOMER") return redirect("/login");

    const projects = await prisma.project.findMany({
      where: { customerId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    });

    return { projects };
  } catch (error) {
    console.error("Project fetch error:", error);
    return { error: "Failed to fetch projects" };
  }
}

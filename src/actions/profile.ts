"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

/**
 * Check whether the current authenticated user already has a profile.
 * Returns an object with { hasProfile: boolean }.
 */
export async function checkProfileExists() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { hasProfile: false };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return { hasProfile: !!profile };
}

/**
 * Save or update the profile for the current authenticated user.
 * Returns { success: boolean, profile?: any, error?: string }.
 */
export async function saveProfile(data: {
  dietType: string;
  allergies?: string;
  calorieGoal: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const parsedCalorie = Number(data.calorieGoal);
    if (isNaN(parsedCalorie) || parsedCalorie < 500 || parsedCalorie > 10000) {
      return { success: false, error: "Invalid calorie goal" };
    }

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        dietType: data.dietType ?? null,
        allergies: data.allergies ?? null,
        calorieGoal: parsedCalorie ?? null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        dietType: data.dietType ?? null,
        allergies: data.allergies ?? null,
        calorieGoal: parsedCalorie ?? null,
      },
    });

    // Revalidate dashboard path so protected server components reflect changes
    try {
      revalidatePath("/dashboard");
    } catch {
      // ignore if revalidation not available in the environment
    }

    return { success: true, profile };
  } catch (err) {
    console.error("Error saving profile (server action):", err);
    return { success: false, error: "Server error" };
  }
}

/**
 * Retrieve the current user's profile (or null).
 */
export async function getProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { profile: null };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return { profile: profile ?? null };
}

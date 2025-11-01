import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * Secured profile POST handler.
 * - Verifies session server-side using Better Auth.
 * - Uses the authenticated user's id from the session (do NOT trust client-provided userId).
 * - Validates calorieGoal and upserts profile.
 */
export async function POST(request: Request) {
  try {
    // Validate session using Better Auth in server context
    const session = await auth.api.getSession({
      headers: request.headers as Headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dietType, allergies, calorieGoal } = body;

    // Basic validation
    const parsedCalorie = calorieGoal ? Number(calorieGoal) : null;
    if (
      parsedCalorie !== null &&
      (isNaN(parsedCalorie) || parsedCalorie < 500 || parsedCalorie > 10000)
    ) {
      return NextResponse.json(
        { error: "Invalid calorie goal" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        dietType: dietType ?? null,
        allergies: allergies ?? null,
        calorieGoal: parsedCalorie ?? null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        dietType: dietType ?? null,
        allergies: allergies ?? null,
        calorieGoal: parsedCalorie ?? null,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Error saving profile (secured):", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

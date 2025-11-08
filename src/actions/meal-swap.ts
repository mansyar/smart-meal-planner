"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";
import { rateLimiter } from "@/lib/rate-limiter";
import { callGeminiJSON } from "@/lib/ai";
import { AlternativesArraySchema, AlternativesArray } from "@/types/schemas";
import { normalizeRecipeDb } from "@/lib/normalize";

const prisma = new PrismaClient();

export interface MealAlternative {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
  };
  prepTimeMinutes: number;
  cookTimeMinutes?: number;
  servings: number;
}

export async function generateMealAlternatives(
  currentMeal: {
    title: string;
    type: string;
    ingredients: string[];
    nutrition: { calories: number };
  },
  userPreferences: {
    dietType?: string;
    allergies?: string;
    calorieGoal?: number;
  },
): Promise<MealAlternative[]> {
  try {
    // Merge provided preferences with the user's saved profile when available.
    const mergedPreferences: {
      dietType?: string | undefined;
      allergies?: string | undefined;
      calorieGoal?: number | undefined;
    } = { ...(userPreferences ?? {}) };

    try {
      const session = await auth.api.getSession({ headers: await headers() });
      if (session?.user?.id) {
        const profile = await prisma.profile.findUnique({
          where: { userId: session.user.id },
        });
        if (profile) {
          if (!mergedPreferences.dietType && profile.dietType) {
            mergedPreferences.dietType = profile.dietType;
          }
          if (
            (!mergedPreferences.allergies ||
              mergedPreferences.allergies === "") &&
            profile.allergies
          ) {
            mergedPreferences.allergies = profile.allergies;
          }
          if (
            !mergedPreferences.calorieGoal &&
            typeof profile.calorieGoal === "number"
          ) {
            mergedPreferences.calorieGoal = profile.calorieGoal;
          }
        }
      }
    } catch (e) {
      // Non-fatal: if profile lookup fails, continue with provided preferences
      console.warn("Could not load profile for meal alternatives:", e);
    }

    const prompt = `Generate 3 alternative meal suggestions to replace "${currentMeal.title}" (${currentMeal.type}).

User preferences:
- Diet type: ${mergedPreferences.dietType || "No specific diet"}
- Allergies: ${mergedPreferences.allergies || "None"}
- Daily calorie goal: ${mergedPreferences.calorieGoal || "No specific goal"}

Current meal details:
- Type: ${currentMeal.type}
- Approximate calories: ${currentMeal.nutrition.calories}
- Ingredients to avoid repeating: ${currentMeal.ingredients.join(", ")}

For each alternative meal, provide:
1. A creative, appealing title
2. Brief description (2-3 sentences)
3. List of 4-8 key ingredients
4. Step-by-step cooking instructions (3-5 steps)
5. Nutrition facts (calories, protein_g, carbs_g, fat_g, fiber_g)
6. Prep time in minutes
7. Cook time in minutes (if applicable)
8. Number of servings (assume 1)

Return the response as a valid JSON array (no surrounding text) matching this schema:
[ { title, description, ingredients, instructions, nutrition, prepTimeMinutes, cookTimeMinutes, servings } ]

Ensure meals are healthy, balanced, and suitable for the user's preferences. Keep calorie counts reasonable for a single meal.`;

    // Use helper to call Gemini and validate JSON using Zod schema
    const alternatives = await callGeminiJSON<AlternativesArray>(
      prompt,
      AlternativesArraySchema,
      3,
    );

    // Map to our internal MealAlternative shape and provide sane defaults
    return alternatives.map((alt) => ({
      title: alt.title || "Alternative Meal",
      description: alt.description || "A healthy meal alternative",
      ingredients: Array.isArray(alt.ingredients) ? alt.ingredients : [],
      instructions: Array.isArray(alt.instructions) ? alt.instructions : [],
      nutrition: {
        calories: alt.nutrition?.calories || 400,
        protein_g: alt.nutrition?.protein_g || 20,
        carbs_g: alt.nutrition?.carbs_g || 40,
        fat_g: alt.nutrition?.fat_g || 15,
        fiber_g: alt.nutrition?.fiber_g || 5,
      },
      prepTimeMinutes: alt.prepTimeMinutes ?? 10,
      cookTimeMinutes: alt.cookTimeMinutes ?? 15,
      servings: alt.servings ?? 1,
    }));
  } catch (error) {
    console.error("Error generating meal alternatives:", error);
    throw new Error("Failed to generate meal alternatives");
  }
}

export async function swapMeal(
  mealPlanId: string,
  dayOfWeek: number,
  mealType: "breakfast" | "lunch" | "dinner",
  newMealData: MealAlternative,
) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "User must be authenticated to swap meals",
      };
    }

    // Validate inputs early to produce clearer errors
    if (!mealPlanId || typeof mealPlanId !== "string") {
      return { success: false, error: "Invalid mealPlanId provided" };
    }
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      return { success: false, error: "Invalid dayOfWeek provided" };
    }
    const allowedTypes = ["breakfast", "lunch", "dinner"] as const;
    if (!allowedTypes.includes(mealType)) {
      return { success: false, error: "Invalid mealType provided" };
    }

    // Authorization: ensure the authenticated user owns the meal plan
    const userId = session.user.id;

    // Rate limit swap calls to protect AI quota
    try {
      rateLimiter.checkLimit(userId, "swap_meal");
    } catch (rlErr) {
      const msg =
        rlErr instanceof Error ? rlErr.message : "Rate limit exceeded";
      return { success: false, error: msg };
    }

    const plan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      select: { userId: true },
    });

    if (!plan || plan.userId !== userId) {
      return {
        success: false,
        error: "Not authorized to modify this meal plan",
      };
    }

    // Create recipe in database using structured JSON fields (schema migrated to Json).
    const recipe = await prisma.recipe.create({
      data: {
        title: newMealData.title,
        description: newMealData.description ?? undefined,
        ingredients: newMealData.ingredients ?? [],
        instructions: newMealData.instructions ?? [],
        nutritionData: newMealData.nutrition ?? {},
        prepTimeMinutes: newMealData.prepTimeMinutes ?? undefined,
        cookTimeMinutes: newMealData.cookTimeMinutes ?? undefined,
        servings: newMealData.servings ?? undefined,
        // imageUrl: could be generated or set later
      },
    });

    // Attempt to update the meal to point to the new recipe (defense-in-depth: ensure meal belongs to user's plan)
    const updatedMeal = await prisma.meal.updateMany({
      where: {
        mealPlanId,
        dayOfWeek,
        type: mealType,
        mealPlan: { userId },
      },
      data: {
        recipeId: recipe.id,
        updatedAt: new Date(),
      },
    });

    // If nothing was updated, clean up the created recipe and return a helpful error
    if (updatedMeal.count === 0) {
      try {
        await prisma.recipe.delete({ where: { id: recipe.id } });
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup recipe after failed swap:",
          cleanupErr,
        );
      }
      return {
        success: false,
        error: `Meal not found for mealPlanId=${mealPlanId} dayOfWeek=${dayOfWeek} type=${mealType}`,
      };
    }

    return {
      success: true,
      recipe: normalizeRecipeDb(recipe),
    };
  } catch (error) {
    console.error("Error swapping meal:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Failed to swap meal: ${msg}` };
  }
}

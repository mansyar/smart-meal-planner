"use server";

import { auth } from "@/lib/auth";
import { PrismaClient, Prisma } from "@/generated/prisma";
import { rateLimiter } from "@/lib/rate-limiter";
import {
  MealGenerationRequest,
  MealGenerationResponse,
  WeekMealPlan,
  WeekUtils,
  MealPlanTransformer,
  MealPlanWithRelations,
  AIMealData,
  Meal,
} from "@/types/meal-plan";
import { callGeminiJSON } from "@/lib/ai";
import { WeeklyPlanSchema, WeeklyPlan } from "@/types/schemas";
import { headers } from "next/headers";
import { normalizeRecipeDb } from "@/lib/normalize";

const prisma = new PrismaClient();

function normalizeWeekStart(date: Date): Date {
  const d = new Date(date);
  // Normalize to UTC midnight to avoid timezone mismatches between stored and computed weekStart
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Generate a weekly meal plan using AI
 */
export async function generateWeeklyMealPlan(
  weekStart: Date,
): Promise<MealGenerationResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    const userId = session.user.id;

    // Check rate limit (10 requests per minute per user)
    try {
      rateLimiter.checkLimit(userId, "generate_meal_plan");
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rate limit exceeded",
      };
    }

    // Get user preferences
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    const preferences = {
      dietType: profile?.dietType || undefined,
      allergies: profile?.allergies
        ? profile.allergies.split(",").map((a: string) => a.trim())
        : [],
      calorieGoal: profile?.calorieGoal || undefined,
    };

    // Generate meal plan using AI
    const mealPlan = await generateMealPlanWithAI({
      userId,
      weekStart: normalizeWeekStart(weekStart),
      preferences,
    });

    if (!mealPlan) {
      return { success: false, error: "Failed to generate meal plan" };
    }

    // Save to database
    await saveMealPlanToDatabase(mealPlan, userId);

    return { success: true, mealPlan };
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Get meal plan for a specific week
 */
export async function getMealPlan(
  weekStart: Date,
): Promise<WeekMealPlan | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    const dbMealPlan = await prisma.mealPlan.findUnique({
      where: {
        userId_weekStart: {
          userId,
          weekStart: normalizeWeekStart(weekStart),
        },
      },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!dbMealPlan) {
      return null;
    }

    // Normalize recipe shape for backward compatibility (handles legacy string fields)
    const normalizedMeals = dbMealPlan.meals.map((m) => {
      const mealRecord = m as unknown as Record<string, unknown>;
      return {
        ...mealRecord,
        recipe: mealRecord["recipe"]
          ? normalizeRecipeDb(mealRecord["recipe"])
          : undefined,
      };
    });

    const normalizedDbMealPlan = {
      ...dbMealPlan,
      meals: normalizedMeals,
    } as unknown as MealPlanWithRelations;

    return MealPlanTransformer.dbToWeekMealPlan(normalizedDbMealPlan);
  } catch (error) {
    console.error("Error getting meal plan:", error);
    return null;
  }
}

/**
 * Get all meal plans for the current user
 */
export async function getUserMealPlans(): Promise<WeekMealPlan[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return [];
    }

    const userId = session.user.id;

    const dbMealPlans = await prisma.mealPlan.findMany({
      where: { userId },
      include: {
        meals: {
          include: {
            recipe: true,
          },
        },
      },
      orderBy: { weekStart: "desc" },
    });

    // Normalize recipes on each meal to ensure UI receives consistent shapes
    const normalizedPlans = dbMealPlans.map((plan) => {
      const p = plan as unknown as { meals?: unknown[] } & Record<
        string,
        unknown
      >;
      const normalizedMeals = (p.meals || []).map((m) => {
        const mi = m as unknown as Record<string, unknown>;
        return {
          ...mi,
          recipe: mi["recipe"] ? normalizeRecipeDb(mi["recipe"]) : undefined,
        };
      });
      return {
        ...(p as object),
        meals: normalizedMeals,
      } as unknown as MealPlanWithRelations;
    });

    return normalizedPlans.map((plan) =>
      MealPlanTransformer.dbToWeekMealPlan(plan),
    );
  } catch (error) {
    console.error("Error getting user meal plans:", error);
    return [];
  }
}

/**
 * Generate meal plan using Google Gemini AI
 */
async function generateMealPlanWithAI(
  request: MealGenerationRequest,
): Promise<WeekMealPlan | null> {
  try {
    const weekDays = WeekUtils.getWeekDays(request.weekStart);
    const weekRange = WeekUtils.formatWeekRange(request.weekStart);

    const prompt = `Generate a healthy, balanced weekly meal plan for ${weekRange}.

User Preferences:
- Diet Type: ${request.preferences.dietType || "No specific diet"}
- Allergies: ${request.preferences.allergies?.join(", ") || "None specified"}
- Daily Calorie Goal: ${request.preferences.calorieGoal || "Around 2000 calories"}

Requirements:
1. Create meals for each day: Monday through Sunday
2. Each day must have: breakfast, lunch, and dinner
3. All meals should be realistic, healthy recipes
4. Respect dietary restrictions and allergies
5. Provide accurate nutrition information for each meal (see format & example below)
6. Include preparation time and serving size
7. Meals should be varied and interesting

Nutrition requirements (important):
- For each meal include a "nutrition" object with numeric values only (no units or text). Fields:
  - calories: integer (per serving)
  - protein_g: number (grams, optional)
  - carbs_g: number (grams, optional)
  - fat_g: number (grams, optional)
  - fiber_g: number (grams, optional)
- Example nutrition object:
  "nutrition": { "calories": 420, "protein_g": 28, "carbs_g": 45, "fat_g": 12, "fiber_g": 6 }

Return a JSON object matching this schema exactly (use numeric values for nutrition, do not include units or commentary inside JSON):
{
  "meals": {
    "Monday": {
      "breakfast": {
        "title": "Overnight oats with berries",
        "description": "Creamy oats soaked overnight with mixed berries",
        "ingredients": ["rolled oats", "milk", "yogurt", "berries"],
        "instructions": ["Mix oats and milk", "Refrigerate overnight", "Top with berries"],
        "nutrition": { "calories": 350, "protein_g": 12, "carbs_g": 48, "fat_g": 8 },
        "prepTimeMinutes": 10,
        "servings": 1
      },
      "lunch": {
        "title": "Grilled chicken salad",
        "description": "Light grilled chicken with mixed greens",
        "ingredients": ["chicken breast", "lettuce", "tomatoes"],
        "instructions": ["Grill chicken", "Assemble salad"],
        "nutrition": { "calories": 450, "protein_g": 35 },
        "prepTimeMinutes": 15,
        "servings": 1
      },
      "dinner": {
        "title": "Roasted salmon with quinoa",
        "description": "Roasted salmon served with quinoa and steamed veggies",
        "ingredients": ["salmon", "quinoa", "vegetables"],
        "instructions": ["Roast salmon", "Cook quinoa"],
        "nutrition": { "calories": 520, "protein_g": 34 },
        "prepTimeMinutes": 20,
        "servings": 1
      }
    },
    ...
  }
}

Important:
- Respond with raw JSON only. Do NOT include units, markdown, or explanatory text outside the JSON.
- If a nutrition value is unknown, omit that key (do not insert strings like "unknown" or include units). Prefer numeric estimates where possible.

Respond with raw JSON only.`;

    // Use helper which validates and retries if necessary
    const aiData = await callGeminiJSON<WeeklyPlan>(
      prompt,
      WeeklyPlanSchema,
      3,
    );

    // Transform AI data to WeekMealPlan
    const weekMealPlan: WeekMealPlan = {
      weekStart: request.weekStart,
      weekEnd: WeekUtils.getWeekEnd(request.weekStart),
      days: weekDays.map((day) => {
        const dayAiMeals = aiData.meals[day.day];
        return {
          ...day,
          meals: {
            breakfast: dayAiMeals?.breakfast
              ? transformAIMealToMeal(
                  dayAiMeals.breakfast as AIMealData,
                  day.dayOfWeek,
                  "breakfast",
                )
              : undefined,
            lunch: dayAiMeals?.lunch
              ? transformAIMealToMeal(
                  dayAiMeals.lunch as AIMealData,
                  day.dayOfWeek,
                  "lunch",
                )
              : undefined,
            dinner: dayAiMeals?.dinner
              ? transformAIMealToMeal(
                  dayAiMeals.dinner as AIMealData,
                  day.dayOfWeek,
                  "dinner",
                )
              : undefined,
          },
        };
      }),
    };

    return weekMealPlan;
  } catch (error) {
    console.error("Error generating meal plan with AI:", error);
    return null;
  }
}

/**
 * Transform AI-generated meal data to Meal object
 */
function transformAIMealToMeal(
  aiMeal: AIMealData,
  dayOfWeek: number,
  type: "breakfast" | "lunch" | "dinner",
): Meal {
  return {
    id: "", // Will be set by database
    mealPlanId: "", // Will be set by database
    dayOfWeek,
    type,
    recipe: {
      id: "", // Will be set by database
      title: aiMeal.title,
      description: aiMeal.description,
      ingredients: aiMeal.ingredients,
      instructions: aiMeal.instructions,
      nutritionData: aiMeal.nutrition,
      prepTimeMinutes: aiMeal.prepTimeMinutes,
      servings: aiMeal.servings,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Save meal plan to database
 */
async function saveMealPlanToDatabase(
  mealPlan: WeekMealPlan,
  userId: string,
): Promise<void> {
  // Use a transaction to ensure data consistency
  await prisma.$transaction(async (tx) => {
    // Create recipes first
    const recipeMap = new Map();

    for (const day of mealPlan.days) {
      for (const meal of Object.values(day.meals)) {
        if (meal?.recipe) {
          const recipe = await tx.recipe.create({
            data: {
              title: meal.recipe.title,
              description: meal.recipe.description ?? undefined,
              ingredients: meal.recipe.ingredients ?? [],
              instructions: meal.recipe.instructions ?? [],
              // Serialize and cast to Prisma InputJsonValue; use JsonNull when empty
              nutritionData:
                meal.recipe.nutritionData &&
                Object.keys(meal.recipe.nutritionData).length > 0
                  ? (JSON.parse(
                      JSON.stringify(meal.recipe.nutritionData),
                    ) as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
              prepTimeMinutes: meal.recipe.prepTimeMinutes ?? undefined,
              cookTimeMinutes: meal.recipe.cookTimeMinutes ?? undefined,
              servings: meal.recipe.servings ?? undefined,
            },
          });
          recipeMap.set(`${day.dayOfWeek}-${meal.type}`, recipe.id);
        }
      }
    }

    // Create meal plan
    const dbMealPlan = await tx.mealPlan.create({
      data: {
        userId,
        weekStart: normalizeWeekStart(mealPlan.weekStart),
      },
    });

    // Create meals
    const mealsData = [];

    for (const day of mealPlan.days) {
      for (const [type, meal] of Object.entries(day.meals)) {
        if (meal) {
          const recipeId = recipeMap.get(`${day.dayOfWeek}-${type}`);
          mealsData.push({
            mealPlanId: dbMealPlan.id,
            dayOfWeek: day.dayOfWeek,
            type: type as "breakfast" | "lunch" | "dinner",
            recipeId,
          });
        }
      }
    }

    await tx.meal.createMany({
      data: mealsData,
    });
  });
}

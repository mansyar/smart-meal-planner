"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";
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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";

const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

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

    return MealPlanTransformer.dbToWeekMealPlan(
      dbMealPlan as unknown as MealPlanWithRelations,
    );
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

    return dbMealPlans.map((plan) =>
      MealPlanTransformer.dbToWeekMealPlan(
        plan as unknown as MealPlanWithRelations,
      ),
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
5. Provide accurate nutrition information for each meal
6. Include preparation time and serving size
7. Meals should be varied and interesting

Format your response as a JSON object with this exact structure:
{
  "meals": {
    "Monday": {
      "breakfast": {
        "title": "Meal Title",
        "description": "Brief description",
        "ingredients": ["ingredient 1", "ingredient 2"],
        "instructions": ["step 1", "step 2"],
        "nutrition": {
          "calories": 400,
          "protein_g": 20,
          "carbs_g": 45,
          "fat_g": 15,
          "fiber_g": 5
        },
        "prepTimeMinutes": 10,
        "servings": 1
      },
      "lunch": {...},
      "dinner": {...}
    },
    "Tuesday": {...},
    ...
  }
}

Ensure the JSON is valid and complete. Focus on nutritious, appealing meals that fit the user's preferences.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response");
      return null;
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Transform AI data to WeekMealPlan
    const weekMealPlan: WeekMealPlan = {
      weekStart: request.weekStart,
      weekEnd: WeekUtils.getWeekEnd(request.weekStart),
      days: weekDays.map((day) => ({
        ...day,
        meals: {
          breakfast: aiData.meals[day.day]?.breakfast
            ? transformAIMealToMeal(
                aiData.meals[day.day].breakfast,
                day.dayOfWeek,
                "breakfast",
              )
            : undefined,
          lunch: aiData.meals[day.day]?.lunch
            ? transformAIMealToMeal(
                aiData.meals[day.day].lunch,
                day.dayOfWeek,
                "lunch",
              )
            : undefined,
          dinner: aiData.meals[day.day]?.dinner
            ? transformAIMealToMeal(
                aiData.meals[day.day].dinner,
                day.dayOfWeek,
                "dinner",
              )
            : undefined,
        },
      })),
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
              ingredients: JSON.stringify(meal.recipe.ingredients),
              instructions: JSON.stringify(meal.recipe.instructions),
              nutritionData: JSON.stringify(meal.recipe.nutritionData),
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

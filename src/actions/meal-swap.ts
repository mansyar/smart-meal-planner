"use server";

import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@/generated/prisma";
import { headers } from "next/headers";

const prisma = new PrismaClient();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Generate 3 alternative meal suggestions to replace "${currentMeal.title}" (${currentMeal.type}).

User preferences:
- Diet type: ${userPreferences.dietType || "No specific diet"}
- Allergies: ${userPreferences.allergies || "None"}
- Daily calorie goal: ${userPreferences.calorieGoal || "No specific goal"}

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

Return the response as a valid JSON array of meal objects. Each meal should have these exact properties: title, description, ingredients (array), instructions (array), nutrition (object), prepTimeMinutes, cookTimeMinutes, servings.

Ensure meals are healthy, balanced, and suitable for the user's preferences. Keep calorie counts reasonable for a single meal.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Gemini response");
    }

    const alternatives: MealAlternative[] = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!Array.isArray(alternatives) || alternatives.length === 0) {
      throw new Error("Invalid response format from Gemini");
    }

    // Ensure each alternative has required properties
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
      prepTimeMinutes: alt.prepTimeMinutes || 10,
      cookTimeMinutes: alt.cookTimeMinutes || 15,
      servings: alt.servings || 1,
    }));
  } catch (error) {
    console.error("Error generating meal alternatives:", error);
    throw new Error("Failed to generate meal alternatives");
  }
}

export async function swapMeal(
  mealPlanId: string,
  dayOfWeek: number,
  mealType: string,
  newMealData: MealAlternative,
) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("User must be authenticated to swap meals");
    }

    // Validate inputs early to produce clearer errors
    if (!mealPlanId || typeof mealPlanId !== "string") {
      throw new Error("Invalid mealPlanId provided");
    }
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      throw new Error("Invalid dayOfWeek provided");
    }
    const allowedTypes = ["breakfast", "lunch", "dinner"];
    if (!allowedTypes.includes(mealType)) {
      throw new Error("Invalid mealType provided");
    }

    // Create recipe in database
    const recipe = await prisma.recipe.create({
      data: {
        title: newMealData.title,
        ingredients: JSON.stringify(newMealData.ingredients ?? []),
        instructions: JSON.stringify(newMealData.instructions ?? []),
        nutritionData: JSON.stringify(newMealData.nutrition ?? {}),
        // imageUrl: could be generated or set later
      },
    });

    // Attempt to update the meal to point to the new recipe
    const updatedMeal = await prisma.meal.updateMany({
      where: {
        mealPlanId,
        dayOfWeek,
        type: mealType,
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
      throw new Error(
        `Meal not found for mealPlanId=${mealPlanId} dayOfWeek=${dayOfWeek} type=${mealType}`,
      );
    }

    return {
      success: true,
      recipe: {
        id: recipe.id,
        title: recipe.title,
        ingredients: newMealData.ingredients,
        instructions: newMealData.instructions,
        nutrition: newMealData.nutrition,
        prepTimeMinutes: newMealData.prepTimeMinutes,
        cookTimeMinutes: newMealData.cookTimeMinutes,
        servings: newMealData.servings,
      },
    };
  } catch (error) {
    console.error("Error swapping meal:", error);
    // Surface original message where reasonable to aid debugging
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to swap meal: ${msg}`);
  }
}

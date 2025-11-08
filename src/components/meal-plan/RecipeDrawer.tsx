"use client";

import { useEffect, useState } from "react";
import type { NutritionData } from "@/types/meal-plan";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import SwapMealDialog from "./SwapMealDialog";
import Image from "next/image";

/**
 * Lightweight meal shape accepted by the drawer. This covers both demo meals
 * and real meals adapted from the database. Using a permissive typed shape
 * avoids tight coupling to DemoMeal while keeping useful fields typed.
 */
type DrawerMealShape = {
  id?: string;
  mealPlanId?: string;
  dayOfWeek?: number;
  title?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  // Normalized nutrition object (preferred) and legacy `nutritionData` for compatibility
  nutrition?: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
  };
  nutritionData?: {
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
  };
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  imageUrl?: string;
  mealType?: "breakfast" | "lunch" | "dinner";
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal?: DrawerMealShape | null;
  enableSwap?: boolean;
  // onMealSwapped receives the created recipe payload for optimistic UI updates
  onMealSwapped?: (payload: {
    recipe: {
      id: string;
      title: string;
      description?: string;
      ingredients: string[];
      instructions: string[];
      nutrition: NutritionData | undefined;
      prepTimeMinutes?: number;
      cookTimeMinutes?: number;
      servings?: number;
    };
    dayOfWeek: number;
    mealType: "breakfast" | "lunch" | "dinner";
  }) => void;
};

export default function RecipeDrawer({
  open,
  onOpenChange,
  meal,
  enableSwap = false,
  onMealSwapped,
}: Props) {
  const { data: session } = useSession();
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);

  useEffect(() => {
    // ensure body scroll isn't locked in some environments; placeholder for future effects
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{meal?.title ?? "Recipe"}</DrawerTitle>
          <DrawerDescription>{meal?.description}</DrawerDescription>
        </DrawerHeader>

        {/* Make the main content scrollable so long accordion sections don't overflow the viewport */}
        <div className="overflow-y-auto max-h-[65vh] space-y-6 px-4 py-2 pb-20 scroll-smooth">
          {/* Image */}
          {meal?.imageUrl ? (
            <Image
              src={meal.imageUrl}
              alt={meal.title ?? "Recipe image"}
              loading="lazy"
              className="h-40 w-full rounded-md object-cover shadow-sm"
            />
          ) : (
            <div
              role="img"
              aria-label={
                meal?.title ? `Image for ${meal.title}` : "Recipe image"
              }
              className="h-40 w-full rounded-md bg-gradient-to-r from-orange-100 to-green-100 flex items-center justify-center text-gray-600 shadow-sm"
            >
              {meal?.mealType ? (
                <span className="text-sm font-medium">
                  Image for {meal.mealType}
                </span>
              ) : (
                <span className="text-sm font-medium">Recipe image</span>
              )}
            </div>
          )}

          {/* Nutrition Table */}
          {meal?.nutrition && (
            <div>
              <h4 className="text-sm font-semibold mb-2">
                Nutrition (per serving)
              </h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Calories</TableCell>
                    <TableCell>
                      {meal?.nutrition?.calories ?? "—"} kcal
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Protein</TableCell>
                    <TableCell>{meal?.nutrition?.protein_g ?? "—"} g</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carbs</TableCell>
                    <TableCell>{meal?.nutrition?.carbs_g ?? "—"} g</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fat</TableCell>
                    <TableCell>{meal?.nutrition?.fat_g ?? "—"} g</TableCell>
                  </TableRow>
                  {meal?.nutrition?.fiber_g !== undefined && (
                    <TableRow>
                      <TableCell>Fiber</TableCell>
                      <TableCell>{meal?.nutrition?.fiber_g} g</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Ingredients / Instructions */}
          <div>
            <Accordion type="single" collapsible>
              <AccordionItem value="ingredients">
                <AccordionTrigger>Ingredients</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
                    {Array.isArray(meal?.ingredients) &&
                    meal!.ingredients.length > 0 ? (
                      meal!.ingredients.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                      ))
                    ) : (
                      <li>—</li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="instructions">
                <AccordionTrigger>Instructions</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    {Array.isArray(meal?.instructions) &&
                    meal!.instructions.length > 0 ? (
                      meal!.instructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))
                    ) : (
                      <li>—</li>
                    )}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <DrawerFooter className="sticky bottom-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
          <div className="flex w-full items-center justify-between px-4 py-2">
            <div className="text-sm text-gray-500">
              {enableSwap ? "Want to swap this meal?" : "Like this meal plan?"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
                aria-label="Close recipe"
              >
                Close
              </Button>

              {enableSwap ? (
                session?.user ? (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-green-600 text-white"
                    onClick={() => setSwapDialogOpen(true)}
                    disabled={!meal} // Disable if no meal data
                  >
                    Swap Meal
                  </Button>
                ) : (
                  <Link href="/signup" aria-label="Sign up to swap this meal">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-green-600 text-white"
                    >
                      Sign up to swap
                    </Button>
                  </Link>
                )
              ) : (
                <Link
                  href="/signup"
                  aria-label="Sign up for personalized meal plans"
                >
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-600 to-green-600 text-white"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>

      {/* Swap Meal Dialog - Only render when swap is enabled */}
      {enableSwap && meal && (
        <SwapMealDialog
          open={swapDialogOpen}
          onOpenChange={setSwapDialogOpen}
          currentMeal={{
            title: meal.title ?? "Recipe",
            type: meal.mealType ?? "meal",
            ingredients: meal.ingredients ?? [],
            // Prefer normalized `nutrition`, fallback to legacy `nutritionData` when present
            nutrition: {
              calories:
                meal.nutrition?.calories ?? meal.nutritionData?.calories ?? 0,
            },
          }}
          mealPlanId={meal.mealPlanId ?? ""} // forwarded from dashboard
          dayOfWeek={meal.dayOfWeek ?? 1} // forwarded from dashboard
          mealType={
            (meal.mealType ?? "lunch") as "breakfast" | "lunch" | "dinner"
          }
          userPreferences={{
            dietType: undefined, // Will be fetched from user profile in dashboard
            allergies: undefined,
            calorieGoal: undefined,
          }}
          onMealSwapped={onMealSwapped}
        />
      )}
    </Drawer>
  );
}

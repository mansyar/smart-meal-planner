"use client";

import { useEffect, useState } from "react";
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
import type { DemoMeal } from "@/data/demo-meal-plan";
import Image from "next/image";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal?: DemoMeal | null;
  enableSwap?: boolean; // Only enable swap for real meal plans (not demo)
};

export default function RecipeDrawer({
  open,
  onOpenChange,
  meal,
  enableSwap = false,
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
                    <TableCell>{meal.nutrition.calories} kcal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Protein</TableCell>
                    <TableCell>{meal.nutrition.protein_g} g</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carbs</TableCell>
                    <TableCell>{meal.nutrition.carbs_g} g</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fat</TableCell>
                    <TableCell>{meal.nutrition.fat_g} g</TableCell>
                  </TableRow>
                  {meal.nutrition.fiber_g !== undefined && (
                    <TableRow>
                      <TableCell>Fiber</TableCell>
                      <TableCell>{meal.nutrition.fiber_g} g</TableCell>
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
                    {meal?.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    )) ?? <li>—</li>}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="instructions">
                <AccordionTrigger>Instructions</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    {meal?.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    )) ?? <li>—</li>}
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
            title: meal.title,
            type: meal.mealType || "meal",
            ingredients: meal.ingredients,
            nutrition: { calories: meal.nutrition.calories },
          }}
          mealPlanId="demo-meal-plan" // This will be replaced with real meal plan ID in dashboard
          dayOfWeek={1} // This will be replaced with real day in dashboard
          mealType={meal.mealType || "lunch"} // This will be replaced with real meal type in dashboard
          userPreferences={{
            dietType: undefined, // Will be fetched from user profile in dashboard
            allergies: undefined,
            calorieGoal: undefined,
          }}
          onMealSwapped={() => {
            // In dashboard implementation, this would refresh the meal plan data
            console.log("Meal swapped");
          }}
        />
      )}
    </Drawer>
  );
}

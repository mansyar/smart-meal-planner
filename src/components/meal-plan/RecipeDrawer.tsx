"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { DemoMeal } from "@/data/demo-meal-plan";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal?: DemoMeal | null;
};

export default function RecipeDrawer({ open, onOpenChange, meal }: Props) {
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
            <img
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
            <div className="text-sm text-gray-500">Want to swap this meal?</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
                aria-label="Close recipe"
              >
                Close
              </Button>

              <Link href="/signup" aria-label="Sign up to swap this meal">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-green-600 text-white"
                >
                  Sign up to swap
                </Button>
              </Link>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

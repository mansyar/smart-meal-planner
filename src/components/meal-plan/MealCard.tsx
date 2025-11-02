"use client";

import { MouseEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import type { DemoMeal } from "@/data/demo-meal-plan";

type Props = {
  meal: DemoMeal;
  onOpen: (meal: DemoMeal) => void;
};

export default function MealCard({ meal, onOpen }: Props) {
  function handleClick(e: MouseEvent) {
    e.preventDefault();
    onOpen(meal);
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-150 ring-1 ring-gray-50 dark:ring-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                meal.mealType === "breakfast"
                  ? "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700"
                  : meal.mealType === "lunch"
                    ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700"
                    : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700"
              }`}
            >
              {meal.mealType?.toUpperCase()}
            </span>
            <CardTitle className="text-sm">{meal.title}</CardTitle>
          </div>
          <div className="text-sm text-gray-500">
            {meal.nutrition.calories} kcal
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">{meal.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              {meal.prepTimeMinutes ? `${meal.prepTimeMinutes}m` : "—"}
            </span>
            <span>•</span>
            <span>{meal.servings ?? 1} serving</span>
          </div>

          <Button
            size="sm"
            onClick={handleClick}
            className="bg-gradient-to-r from-orange-600 to-green-600 text-white hover:from-orange-700 hover:to-green-700"
            aria-label={`View ${meal.title} recipe`}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

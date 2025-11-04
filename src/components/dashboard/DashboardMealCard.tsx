"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat } from "lucide-react";
import { Meal } from "@/types/meal-plan";

interface DashboardMealCardProps {
  meal: Meal;
  mealType: "breakfast" | "lunch" | "dinner";
  onViewRecipe?: (meal: Meal) => void;
  compact?: boolean;
}

export function DashboardMealCard({
  meal,
  mealType,
  onViewRecipe,
  compact = false,
}: DashboardMealCardProps) {
  if (!meal.recipe) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No {mealType} planned
      </div>
    );
  }

  const recipe = meal.recipe;
  const nutritionData =
    typeof recipe.nutritionData === "string"
      ? JSON.parse(recipe.nutritionData)
      : recipe.nutritionData;

  return (
    <Card
      className={`hover:shadow-md transition-shadow duration-150 ring-1 ring-gray-50 dark:ring-gray-800 ${compact ? "p-3" : ""}`}
    >
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                mealType === "breakfast"
                  ? "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700"
                  : mealType === "lunch"
                    ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700"
                    : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700"
              }`}
            >
              {mealType?.toUpperCase()}
            </span>
            <CardTitle
              className={`font-medium ${compact ? "text-sm" : "text-base"}`}
            >
              {recipe.title}
            </CardTitle>
          </div>
          <div className="text-sm text-gray-500">
            {nutritionData.calories} kcal
          </div>
        </div>
      </CardHeader>

      <CardContent className={compact ? "pt-0" : ""}>
        {recipe.description && !compact && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {recipe.prepTimeMinutes && (
              <>
                <Clock className="h-4 w-4" />
                <span>{recipe.prepTimeMinutes}m</span>
              </>
            )}
            {recipe.servings && (
              <>
                <span>•</span>
                <span>
                  {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>

          {onViewRecipe && (
            <Button
              size="sm"
              onClick={() => onViewRecipe(meal)}
              className="bg-gradient-to-r from-orange-600 to-green-600 text-white text-xs"
            >
              <ChefHat className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

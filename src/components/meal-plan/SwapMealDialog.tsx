"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Loader2, Clock, Users } from "lucide-react";
import {
  generateMealAlternatives,
  swapMeal,
  type MealAlternative,
} from "@/actions/meal-swap";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMeal: {
    title: string;
    type: string;
    ingredients: string[];
    nutrition: { calories: number };
  };
  mealPlanId: string;
  dayOfWeek: number;
  mealType: string;
  userPreferences: {
    dietType?: string;
    allergies?: string;
    calorieGoal?: number;
  };
  onMealSwapped?: () => void;
};

export default function SwapMealDialog({
  open,
  onOpenChange,
  currentMeal,
  mealPlanId,
  dayOfWeek,
  mealType,
  userPreferences,
  onMealSwapped,
}: Props) {
  const [alternatives, setAlternatives] = useState<MealAlternative[]>([]);
  const [selectedAlternative, setSelectedAlternative] =
    useState<MealAlternative | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleGenerateAlternatives = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMealAlternatives(
        currentMeal,
        userPreferences,
      );
      setAlternatives(result);
      setSelectedAlternative(null);
    } catch (error) {
      console.error("Failed to generate alternatives:", error);
      toast.error("Failed to generate meal alternatives. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwapMeal = async () => {
    if (!selectedAlternative) return;

    setIsSwapping(true);
    startTransition(async () => {
      try {
        const result = await swapMeal(
          mealPlanId,
          dayOfWeek,
          mealType,
          selectedAlternative,
        );

        if (result.success) {
          toast.success("Meal swapped successfully!");
          onOpenChange(false);
          onMealSwapped?.();
          router.refresh();
        } else {
          toast.error("Failed to swap meal. Please try again.");
        }
      } catch (error) {
        console.error("Failed to swap meal:", error);
        toast.error("Failed to swap meal. Please try again.");
      } finally {
        setIsSwapping(false);
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAlternatives([]);
      setSelectedAlternative(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Swap Meal: {currentMeal.title}</DialogTitle>
          <DialogDescription>
            Generate AI-powered alternatives for your {mealType} meal. Select
            one to swap it out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Meal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Title:</strong> {currentMeal.title}
                </div>
                <div>
                  <strong>Calories:</strong> {currentMeal.nutrition.calories}{" "}
                  kcal
                </div>
                <div>
                  <strong>Type:</strong> {currentMeal.type}
                </div>
                <div>
                  <strong>Ingredients:</strong> {currentMeal.ingredients.length}{" "}
                  items
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          {alternatives.length === 0 && (
            <div className="text-center">
              <Button
                onClick={handleGenerateAlternatives}
                disabled={isGenerating}
                className="bg-gradient-to-r from-orange-600 to-green-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Alternatives...
                  </>
                ) : (
                  "Generate Meal Alternatives"
                )}
              </Button>
            </div>
          )}

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose an Alternative</h3>
              <div className="grid gap-4">
                {alternatives.map((alt, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedAlternative === alt
                        ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedAlternative(alt)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{alt.title}</CardTitle>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          {alt.nutrition.calories} kcal
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alt.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Ingredients:</strong>
                          <ul className="list-disc list-inside mt-1 text-gray-700 dark:text-gray-300">
                            {alt.ingredients.slice(0, 4).map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                            {alt.ingredients.length > 4 && (
                              <li>+{alt.ingredients.length - 4} more...</li>
                            )}
                          </ul>
                        </div>
                        <div>
                          <strong>Instructions:</strong>
                          <ol className="list-decimal list-inside mt-1 text-gray-700 dark:text-gray-300">
                            {alt.instructions.slice(0, 2).map((step, i) => (
                              <li key={i} className="truncate">
                                {step}
                              </li>
                            ))}
                            {alt.instructions.length > 2 && (
                              <li>
                                +{alt.instructions.length - 2} more steps...
                              </li>
                            )}
                          </ol>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Prep: {alt.prepTimeMinutes}m
                          {alt.cookTimeMinutes &&
                            `, Cook: ${alt.cookTimeMinutes}m`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Serves: {alt.servings}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          {selectedAlternative && (
            <Button
              onClick={handleSwapMeal}
              disabled={isSwapping || isPending}
              className="bg-gradient-to-r from-orange-600 to-green-600 text-white"
            >
              {isSwapping || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Swapping Meal...
                </>
              ) : (
                "Swap Meal"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

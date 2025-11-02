"use client";

import { useState, useEffect } from "react";
import { WeekMealPlan, WeekUtils } from "@/types/meal-plan";
import { getMealPlan, generateWeeklyMealPlan } from "@/actions/meal-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EmptyMealPlan } from "./EmptyMealPlan";
import { DashboardMealCard } from "./DashboardMealCard";

interface UserDashboardProps {
  initialWeekStart?: Date;
}

export function UserDashboard({ initialWeekStart }: UserDashboardProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    initialWeekStart || WeekUtils.getWeekStart(new Date()),
  );
  const [mealPlan, setMealPlan] = useState<WeekMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Load meal plan for current week
  const loadMealPlan = async (weekStart: Date) => {
    try {
      setLoading(true);
      const plan = await getMealPlan(weekStart);
      setMealPlan(plan);
    } catch (error) {
      console.error("Error loading meal plan:", error);
      toast.error("Failed to load meal plan");
    } finally {
      setLoading(false);
    }
  };

  // Generate new meal plan
  const handleGenerateMealPlan = async () => {
    try {
      setGenerating(true);
      const result = await generateWeeklyMealPlan(currentWeekStart);

      if (result.success && result.mealPlan) {
        setMealPlan(result.mealPlan);
        toast.success("Meal plan generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate meal plan");
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast.error("Failed to generate meal plan");
    } finally {
      setGenerating(false);
    }
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = WeekUtils.getPreviousWeek(currentWeekStart);
    setCurrentWeekStart(newWeekStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = WeekUtils.getNextWeek(currentWeekStart);
    setCurrentWeekStart(newWeekStart);
  };

  // Load meal plan when week changes
  useEffect(() => {
    loadMealPlan(currentWeekStart);
  }, [currentWeekStart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mealPlan) {
    const currentWeekStartCalculated = WeekUtils.getWeekStart(new Date());
    // Compare dates by normalizing time to 00:00:00
    const currentWeekStartNormalized = new Date(currentWeekStart);
    currentWeekStartNormalized.setHours(0, 0, 0, 0);
    const currentWeekStartCalculatedNormalized = new Date(
      currentWeekStartCalculated,
    );
    currentWeekStartCalculatedNormalized.setHours(0, 0, 0, 0);
    const isCurrentWeek =
      currentWeekStartNormalized.getTime() ===
      currentWeekStartCalculatedNormalized.getTime();
    return (
      <EmptyMealPlan
        weekStart={currentWeekStart}
        onGenerate={handleGenerateMealPlan}
        generating={generating}
        onWeekChange={setCurrentWeekStart}
        isCurrentWeek={isCurrentWeek}
      />
    );
  }

  const isCurrentWeek = WeekUtils.isCurrentWeek(currentWeekStart);
  const weekRange = WeekUtils.formatWeekRange(currentWeekStart);

  return (
    <div className="space-y-6">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Meal Plan</h1>
          <p className="text-muted-foreground">{weekRange}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            disabled={generating}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Week
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            disabled={generating}
          >
            Next Week
            <ChevronRight className="h-4 w-4" />
          </Button>

          {isCurrentWeek && (
            <Button
              onClick={handleGenerateMealPlan}
              disabled={generating}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate New Plan
            </Button>
          )}
        </div>
      </div>

      {/* Meal plan grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mealPlan.days.map((day) => (
          <Card key={day.day} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {day.day}
                {isCurrentWeek && WeekUtils.isCurrentWeek(day.date) && (
                  <Badge variant="secondary" className="text-xs">
                    Today
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(day.meals).map(([mealType, meal]) => (
                <div key={mealType}>
                  {meal ? (
                    <DashboardMealCard
                      meal={meal}
                      mealType={mealType as "breakfast" | "lunch" | "dinner"}
                      compact
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No {mealType} planned
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mealPlan.days.reduce(
                  (total, day) =>
                    total + Object.values(day.meals).filter(Boolean).length,
                  0,
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Meals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mealPlan.days.length * 3}
              </div>
              <div className="text-sm text-muted-foreground">Planned Slots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {
                  new Set(
                    mealPlan.days.flatMap((day) =>
                      Object.values(day.meals)
                        .filter(Boolean)
                        .map((meal) => meal?.recipe?.title)
                        .filter(Boolean),
                    ),
                  ).size
                }
              </div>
              <div className="text-sm text-muted-foreground">
                Unique Recipes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  mealPlan.days.reduce(
                    (total, day) =>
                      total +
                      Object.values(day.meals).reduce(
                        (dayTotal, meal) =>
                          dayTotal +
                          (meal?.recipe?.nutritionData?.calories || 0),
                        0,
                      ),
                    0,
                  ) / mealPlan.days.length,
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Daily Calories
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

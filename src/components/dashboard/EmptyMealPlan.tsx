"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { WeekUtils } from "@/types/meal-plan";

interface EmptyMealPlanProps {
  weekStart: Date;
  onGenerate: () => void;
  generating: boolean;
  onWeekChange: (weekStart: Date) => void;
  isCurrentWeek: boolean;
}

export function EmptyMealPlan({
  weekStart,
  onGenerate,
  generating,
  onWeekChange,
  isCurrentWeek,
}: EmptyMealPlanProps) {
  const weekRange = WeekUtils.formatWeekRange(weekStart);

  const goToPreviousWeek = () => {
    const newWeekStart = WeekUtils.getPreviousWeek(weekStart);
    onWeekChange(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = WeekUtils.getNextWeek(weekStart);
    onWeekChange(newWeekStart);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Your Meal Plan</h1>
        <p className="text-muted-foreground">{weekRange}</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          disabled={generating}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          disabled={generating}
        >
          Next Week
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Empty State Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-100 to-pink-100">
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">
            {isCurrentWeek
              ? "No meal plan for this week"
              : "No meal plan found"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isCurrentWeek
              ? "Let's create a personalized meal plan tailored to your preferences and dietary needs."
              : "This week doesn't have a meal plan yet. You can generate one or navigate to a different week."}
          </p>

          {isCurrentWeek && (
            <div className="space-y-4">
              <Button
                onClick={onGenerate}
                disabled={generating}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 text-lg"
              >
                {generating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating your meal plan...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generate Meal Plan
                  </div>
                )}
              </Button>

              <p className="text-sm text-muted-foreground">
                Our AI will create a balanced 7-day meal plan based on your
                profile preferences, including dietary restrictions and calorie
                goals.
              </p>
            </div>
          )}

          {!isCurrentWeek && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can only generate meal plans for the current week. Navigate
                back to this week to create a new plan.
              </p>

              <Button
                variant="outline"
                onClick={() => onWeekChange(WeekUtils.getWeekStart(new Date()))}
              >
                Go to Current Week
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Preview */}
      {isCurrentWeek && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">What you&apos;ll get:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                <div>
                  <div className="font-medium">Personalized Recipes</div>
                  <div className="text-muted-foreground">
                    Meals tailored to your diet type and allergies
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <div className="font-medium">Nutritional Balance</div>
                  <div className="text-muted-foreground">
                    Calorie-appropriate meals with complete nutrition info
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <div className="font-medium">Meal Swapping</div>
                  <div className="text-muted-foreground">
                    Easily swap meals with AI-generated alternatives
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                <div>
                  <div className="font-medium">Shopping Lists</div>
                  <div className="text-muted-foreground">
                    Auto-generated shopping lists from your meal plan
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

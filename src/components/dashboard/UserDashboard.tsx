"use client";

import { useState, useEffect } from "react";
import {
  WeekMealPlan,
  WeekUtils,
  Meal,
  NutritionData,
} from "@/types/meal-plan";
import { getMealPlan, generateWeeklyMealPlan } from "@/actions/meal-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EmptyMealPlan } from "./EmptyMealPlan";
import { DashboardMealCard } from "./DashboardMealCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecipeDrawer from "@/components/meal-plan/RecipeDrawer";

interface UserDashboardProps {
  initialWeekStart?: Date;
}

/**
 * DrawerMeal mirrors the demo meal shape expected by RecipeDrawer.
 * We build this from the real Meal.recipe when opening the drawer.
 */
type DrawerMeal = {
  id?: string;
  mealPlanId?: string;
  dayOfWeek?: number;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
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

export function UserDashboard({ initialWeekStart }: UserDashboardProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    initialWeekStart || WeekUtils.getWeekStart(new Date()),
  );
  const [mealPlan, setMealPlan] = useState<WeekMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Drawer state for viewing recipes
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<DrawerMeal | null>(null);

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

  // Map Meal (from DB/UI) to DrawerMeal expected by RecipeDrawer
  function toDrawerMeal(meal: Meal): DrawerMeal | null {
    const r = meal.recipe;
    if (!r) return null;

    // Normalize nutrition (may be stored as JSON string)
    function parseNutrition(raw: unknown): NutritionData | undefined {
      if (!raw) return undefined;
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object")
            return parsed as NutritionData;
          return undefined;
        } catch {
          return undefined;
        }
      }
      if (typeof raw === "object") return raw as NutritionData;
      return undefined;
    }
    const nutrition = parseNutrition(
      (r as unknown as Record<string, unknown>).nutritionData,
    );

    // Normalize ingredients which might be stored as JSON strings in DB
    function parseStringArray(raw: unknown): string[] {
      if (!raw) return [];
      if (Array.isArray(raw))
        return raw.filter((x): x is string => typeof x === "string");
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed))
            return parsed.filter((x): x is string => typeof x === "string");
        } catch {
          const s = raw as string;
          if (s.includes("\n"))
            return s
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean);
          return s
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      return [];
    }
    const ingredients: string[] = parseStringArray(
      (r as unknown as Record<string, unknown>).ingredients,
    );

    // Normalize instructions which might be stored as JSON strings in DB
    function parseInstructions(raw: unknown): string[] {
      if (!raw) return [];
      if (Array.isArray(raw))
        return raw.filter((x): x is string => typeof x === "string");
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed))
            return parsed.filter((x): x is string => typeof x === "string");
        } catch {
          const s = raw as string;
          if (s.includes("\n"))
            return s
              .split("\n")
              .map((t) => t.trim())
              .filter(Boolean);
          if (s.includes("."))
            return s
              .split(".")
              .map((t) => t.trim())
              .filter(Boolean);
          return s
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      return [];
    }
    const instructions: string[] = parseInstructions(
      (r as unknown as Record<string, unknown>).instructions,
    );

    return {
      id: r.id,
      mealPlanId: meal.mealPlanId,
      dayOfWeek: meal.dayOfWeek,
      title: r.title,
      description: r.description,
      ingredients,
      instructions,
      nutrition: {
        calories: nutrition?.calories ?? 0,
        protein_g: nutrition?.protein_g,
        carbs_g: nutrition?.carbs_g,
        fat_g: nutrition?.fat_g,
        fiber_g: nutrition?.fiber_g,
      },
      prepTimeMinutes: r.prepTimeMinutes,
      cookTimeMinutes: r.cookTimeMinutes,
      servings: r.servings,
      imageUrl: r.imageUrl,
      mealType: meal.type,
    };
  }

  function openMeal(meal: Meal) {
    const d = toDrawerMeal(meal);
    if (d) {
      setSelectedMeal(d);
      setDrawerOpen(true);
    }
  }

  // Robust calories extractor that handles different storage shapes:
  // - recipe.nutritionData (object or JSON string)
  // - recipe.nutrition (legacy field)
  // - demo-style recipe.nutrition field
  // Falls back to scanning the recipe object for a numeric "calories" value.
  function getMealCalories(meal?: Meal | null): number {
    if (!meal?.recipe) return 0;

    const recipeAny = meal.recipe as unknown as Record<string, unknown>;

    // Candidate raw sources
    const candidates = [
      recipeAny.nutritionData,
      recipeAny.nutrition,
      recipeAny, // last resort: scan the whole object
    ];

    for (const raw of candidates) {
      if (raw == null) continue;

      // If it's a string, try to parse JSON
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          const c = extractCalories(parsed);
          if (c > 0) return c;
        } catch {
          // fallback: ignore parse errors and continue
        }
      } else if (typeof raw === "object") {
        const c = extractCalories(raw);
        if (c > 0) return c;
      } else if (typeof raw === "number") {
        // unlikely, but handle numeric direct value
        return Number.isFinite(raw) ? raw : 0;
      }
    }

    return 0;

    // Helper: shallow search for a numeric calories field
    function extractCalories(obj: unknown): number {
      if (!obj || typeof obj !== "object") return 0;
      const o = obj as Record<string, unknown>;

      // direct calories
      const direct = o["calories"];
      if (typeof direct === "number" && Number.isFinite(direct)) return direct;

      // nested nutrition object
      const nutritionVal = o["nutrition"];
      if (nutritionVal && typeof nutritionVal === "object") {
        const n = nutritionVal as Record<string, unknown>;
        const c = n["calories"];
        if (typeof c === "number" && Number.isFinite(c)) return c;
      }

      // search for keys with "calor" or nested calories
      for (const k of Object.keys(o)) {
        try {
          const v = o[k];
          if (
            typeof v === "number" &&
            Number.isFinite(v) &&
            k.toLowerCase().includes("calor")
          ) {
            return v;
          }
          if (v && typeof v === "object") {
            const vv = v as Record<string, unknown>;
            const c2 = vv["calories"];
            if (typeof c2 === "number" && Number.isFinite(c2)) return c2;
          }
        } catch {
          continue;
        }
      }
      return 0;
    }
  }

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

      {/* Info banner matching demo */}
      <div className="mt-4 rounded-md bg-gradient-to-r from-orange-50 to-green-50 p-3 text-sm text-gray-700 border border-gray-100">
        Tip: Click a meal to view its recipe or swap it.
      </div>

      {/* Tabs per day (demo-style) */}
      <section>
        <Tabs defaultValue={mealPlan.days[0]?.day ?? "Monday"}>
          <TabsList className="mb-4 overflow-x-auto space-x-2">
            {mealPlan.days.map((d) => (
              <TabsTrigger
                key={d.day}
                value={d.day}
                className="min-w-[96px] rounded-md px-3 py-2 text-sm [data-state=active]:bg-gradient-to-r [data-state=active]:from-orange-600 [data-state=active]:to-green-600 [data-state=active]:text-white"
              >
                {d.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {mealPlan.days.map((d) => (
            <TabsContent key={d.day} value={d.day}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                {(["breakfast", "lunch", "dinner"] as const).map((type) => {
                  const m = d.meals[type];
                  return m ? (
                    <DashboardMealCard
                      key={type}
                      meal={m}
                      mealType={type}
                      onViewRecipe={openMeal}
                      compact
                    />
                  ) : (
                    <div
                      key={type}
                      className="text-sm text-muted-foreground italic"
                    >
                      No {type} planned
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

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
                {(() => {
                  const totalCalories = mealPlan.days.reduce((total, day) => {
                    return (
                      total +
                      Object.values(day.meals).reduce((dayTotal, meal) => {
                        return dayTotal + getMealCalories(meal ?? null);
                      }, 0)
                    );
                  }, 0);
                  return Math.round(
                    totalCalories / Math.max(1, mealPlan.days.length),
                  );
                })()}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Daily Calories
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Drawer */}
      <RecipeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        meal={selectedMeal ?? undefined}
        enableSwap={true}
        onMealSwapped={() => {
          // Refresh the current week's meal plan after a successful swap
          loadMealPlan(currentWeekStart);
        }}
      />
    </div>
  );
}

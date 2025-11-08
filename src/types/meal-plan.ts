// Core meal plan types based on database schema

export interface NutritionData {
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  nutritionData: NutritionData;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  mealPlanId: string;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  type: "breakfast" | "lunch" | "dinner";
  recipe?: Recipe;
  recipeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: Date;
  meals: Meal[];
  createdAt: Date;
  updatedAt: Date;
}

// UI-specific types for displaying meal plans
export interface DayMeals {
  day: string;
  dayOfWeek: number;
  date: Date;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  };
}

export interface WeekMealPlan {
  weekStart: Date;
  weekEnd: Date;
  days: DayMeals[];
}

// AI Generation types
export interface MealGenerationRequest {
  userId: string;
  weekStart: Date;
  preferences: {
    dietType?: string;
    allergies?: string[];
    calorieGoal?: number;
  };
}

export interface MealGenerationResponse {
  success: boolean;
  mealPlan?: WeekMealPlan;
  error?: string;
}

// Database query result types
export interface MealPlanWithRelations extends MealPlan {
  meals: (Meal & { recipe: Recipe })[];
}

// AI response types
export interface AIMealData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: NutritionData;
  prepTimeMinutes: number;
  servings: number;
}

export interface AIDayMeals {
  breakfast?: AIMealData;
  lunch?: AIMealData;
  dinner?: AIMealData;
}

export interface AIResponseData {
  meals: Record<string, AIDayMeals>;
}

// Week navigation utilities
export class WeekUtils {
  /**
   * Get the start of the week (Monday) for a given date
   */
  static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  /**
   * Get the end of the week (Sunday) for a given date
   */
  static getWeekEnd(date: Date): Date {
    const weekStart = this.getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  }

  /**
   * Get all days in a week as DayMeals objects
   */
  static getWeekDays(weekStart: Date): DayMeals[] {
    const days: DayMeals[] = [];
    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      days.push({
        day: dayNames[i],
        dayOfWeek: i + 1,
        date,
        meals: {},
      });
    }

    return days;
  }

  /**
   * Navigate to previous week
   */
  static getPreviousWeek(weekStart: Date): Date {
    const prevWeek = new Date(weekStart);
    prevWeek.setDate(weekStart.getDate() - 7);
    return prevWeek;
  }

  /**
   * Navigate to next week
   */
  static getNextWeek(weekStart: Date): Date {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(weekStart.getDate() + 7);
    return nextWeek;
  }

  /**
   * Check if a date is in the current week
   */
  static isCurrentWeek(date: Date): boolean {
    const now = new Date();
    const currentWeekStart = this.getWeekStart(now);
    const currentWeekEnd = this.getWeekEnd(now);
    return date >= currentWeekStart && date <= currentWeekEnd;
  }

  /**
   * Format week range for display (e.g., "Nov 3 - Nov 9, 2025")
   */
  static formatWeekRange(weekStart: Date): string {
    const weekEnd = this.getWeekEnd(weekStart);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const startStr = weekStart.toLocaleDateString("en-US", options);
    const endStr = weekEnd.toLocaleDateString("en-US", options);

    // If same year, don't repeat year
    if (weekStart.getFullYear() === weekEnd.getFullYear()) {
      const startOptions = { ...options };
      delete startOptions.year;
      return `${weekStart.toLocaleDateString("en-US", startOptions)} - ${endStr}`;
    }

    return `${startStr} - ${endStr}`;
  }
}

// Database transformation utilities
export class MealPlanTransformer {
  /**
   * Transform database MealPlan to UI WeekMealPlan
   */
  static dbToWeekMealPlan(dbMealPlan: MealPlan): WeekMealPlan {
    const weekStart = new Date(dbMealPlan.weekStart);
    const days = WeekUtils.getWeekDays(weekStart);

    // Group meals by day and type
    dbMealPlan.meals.forEach((meal) => {
      const dayIndex = meal.dayOfWeek - 1;
      if (days[dayIndex]) {
        days[dayIndex].meals[meal.type as keyof (typeof days)[0]["meals"]] =
          meal;
      }
    });

    return {
      weekStart,
      weekEnd: WeekUtils.getWeekEnd(weekStart),
      days,
    };
  }

  /**
   * Transform UI WeekMealPlan to database format for creation
   */
  static weekMealPlanToDb(
    weekMealPlan: WeekMealPlan,
    userId: string,
  ): Omit<MealPlan, "id" | "createdAt" | "updatedAt"> {
    const meals: Omit<Meal, "id" | "createdAt" | "updatedAt">[] = [];

    weekMealPlan.days.forEach((day) => {
      Object.entries(day.meals).forEach(([type, meal]) => {
        if (meal) {
          meals.push({
            dayOfWeek: day.dayOfWeek,
            type: type as "breakfast" | "lunch" | "dinner",
            recipeId: meal.recipe?.id,
            mealPlanId: "", // Will be set when creating the meal plan
          });
        }
      });
    });

    return {
      userId,
      weekStart: weekMealPlan.weekStart,
      meals: meals as Meal[],
    };
  }
}

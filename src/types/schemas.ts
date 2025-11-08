import { z } from "zod";

export const NutritionSchema = z.object({
  // Accept numbers or numeric strings like "200 kcal" by preprocessing
  calories: z.preprocess((val) => {
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? Number(m[0]) : undefined;
    }
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().min(0).max(5000)),
  protein_g: z.preprocess((val) => {
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? Number(m[0]) : undefined;
    }
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().min(0).max(200).optional()),
  carbs_g: z.preprocess((val) => {
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? Number(m[0]) : undefined;
    }
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().min(0).max(1000).optional()),
  fat_g: z.preprocess((val) => {
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? Number(m[0]) : undefined;
    }
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().min(0).max(500).optional()),
  fiber_g: z.preprocess((val) => {
    if (typeof val === "string") {
      const m = val.match(/-?\d+(\.\d+)?/);
      return m ? Number(m[0]) : undefined;
    }
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().min(0).max(500).optional()),
});

export const MealAlternativeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ingredients: z.array(z.string()).min(1),
  instructions: z.array(z.string()).min(1),
  nutrition: NutritionSchema,
  prepTimeMinutes: z.number().int().min(0).optional(),
  cookTimeMinutes: z.number().int().min(0).optional(),
  servings: z.number().int().min(1),
});

export const AlternativesArraySchema = z.array(MealAlternativeSchema).min(1);

export const AIMealSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  nutrition: NutritionSchema,
  prepTimeMinutes: z.number().int().min(0).optional(),
  cookTimeMinutes: z.number().int().min(0).optional(),
  servings: z.number().int().min(1).optional(),
});

export const DailyMealsSchema = z.object({
  breakfast: AIMealSchema.optional(),
  lunch: AIMealSchema.optional(),
  dinner: AIMealSchema.optional(),
});

export const WeeklyPlanSchema = z.object({
  meals: z.record(z.string(), DailyMealsSchema),
});

export type AlternativesArray = z.infer<typeof AlternativesArraySchema>;
export type WeeklyPlan = z.infer<typeof WeeklyPlanSchema>;

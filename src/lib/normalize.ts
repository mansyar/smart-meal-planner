import type { NutritionData } from "@/types/meal-plan";

export function parseJsonField<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

export function normalizeRecipeDb(recipe: unknown) {
  // Narrow the unknown recipe into a record so we can safely access keys without using `any`
  const r = (recipe as Record<string, unknown> | null) ?? null;

  // Parse nutrition and coerce numeric-looking values into numbers.
  function toNumber(v: unknown): number | undefined {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const cleaned = (v as string).trim().replace(/[^\d\.\-]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  }

  const parsedNutritionRaw =
    parseJsonField<Record<string, unknown>>(r ? r["nutritionData"] : null) ??
    undefined;

  const nutrition: NutritionData | undefined =
    parsedNutritionRaw && Object.keys(parsedNutritionRaw).length > 0
      ? (() => {
          const calories = toNumber(parsedNutritionRaw["calories"]);
          // Require calories to consider nutrition present
          if (calories === undefined) return undefined;
          const protein_g = toNumber(parsedNutritionRaw["protein_g"]);
          const carbs_g = toNumber(parsedNutritionRaw["carbs_g"]);
          const fat_g = toNumber(parsedNutritionRaw["fat_g"]);
          const fiber_g = toNumber(parsedNutritionRaw["fiber_g"]);
          const out: NutritionData = { calories };
          if (protein_g !== undefined) out.protein_g = protein_g;
          if (carbs_g !== undefined) out.carbs_g = carbs_g;
          if (fat_g !== undefined) out.fat_g = fat_g;
          if (fiber_g !== undefined) out.fiber_g = fiber_g;
          return out;
        })()
      : undefined;

  return {
    id: r && typeof r["id"] === "string" ? (r["id"] as string) : "",
    title: r ? ((r["title"] as string | undefined) ?? "") : "",
    description:
      r && typeof r["description"] === "string"
        ? (r["description"] as string)
        : undefined,
    ingredients: parseJsonField<string[]>(r ? r["ingredients"] : null) ?? [],
    instructions: parseJsonField<string[]>(r ? r["instructions"] : null) ?? [],
    // Provide both keys for compatibility: `nutrition` is used in UI, `nutritionData` kept for legacy/DB mapping
    nutrition,
    nutritionData: parsedNutritionRaw ?? {},
    prepTimeMinutes:
      r && typeof r["prepTimeMinutes"] === "number"
        ? (r["prepTimeMinutes"] as number)
        : undefined,
    cookTimeMinutes:
      r && typeof r["cookTimeMinutes"] === "number"
        ? (r["cookTimeMinutes"] as number)
        : undefined,
    servings:
      r && typeof r["servings"] === "number"
        ? (r["servings"] as number)
        : undefined,
    imageUrl:
      r && typeof r["imageUrl"] === "string"
        ? (r["imageUrl"] as string)
        : undefined,
    createdAt: r ? (r["createdAt"] as Date | string | undefined) : undefined,
    updatedAt: r ? (r["updatedAt"] as Date | string | undefined) : undefined,
  };
}

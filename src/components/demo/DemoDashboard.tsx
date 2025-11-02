"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DemoDialog from "@/components/demo/DemoDialog";
import DemoCTA from "@/components/demo/DemoCTA";
import MealCard from "@/components/meal-plan/MealCard";
import RecipeDrawer from "@/components/meal-plan/RecipeDrawer";
import type { DemoDay, DemoMeal } from "@/data/demo-meal-plan";

type Props = {
  demoMealPlan: DemoDay[];
};

export default function DemoDashboard({ demoMealPlan }: Props) {
  const [, setSelectedDay] = useState<string>(demoMealPlan[0]?.day ?? "Monday");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<DemoMeal | null>(null);

  function handleOpenMeal(meal: DemoMeal) {
    setSelectedMeal(meal);
    setDrawerOpen(true);
  }

  // function handleClose() {
  //   setDrawerOpen(false);
  //   setTimeout(() => setSelectedMeal(null), 300);
  // }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sample 7‑Day Meal Plan
            </h1>
            <p className="text-sm text-gray-600">
              Balanced diet • ~2000 kcal/day
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-orange-600 to-green-600 text-white">
                Sign up to customize
              </Button>
            </Link>
            <DemoDialog />
          </div>
        </div>

        <div className="mt-4 rounded-md bg-gradient-to-r from-orange-50 to-green-50 p-3 text-sm text-gray-700 border border-gray-100">
          This is a demo plan. Sign up to save, swap meals, and export as PDF.
        </div>
      </header>

      <section>
        <Tabs
          defaultValue={demoMealPlan[0]?.day ?? "Monday"}
          onValueChange={(v: string) => setSelectedDay(v)}
        >
          <TabsList className="mb-4 overflow-x-auto space-x-2">
            {demoMealPlan.map((d) => (
              <TabsTrigger
                key={d.day}
                value={d.day}
                className="min-w-[96px] rounded-md px-3 py-2 text-sm [data-state=active]:bg-gradient-to-r [data-state=active]:from-orange-600 [data-state=active]:to-green-600 [data-state=active]:text-white"
              >
                {d.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {demoMealPlan.map((d) => (
            <TabsContent key={d.day} value={d.day}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                <MealCard meal={d.meals.breakfast} onOpen={handleOpenMeal} />
                <MealCard meal={d.meals.lunch} onOpen={handleOpenMeal} />
                <MealCard meal={d.meals.dinner} onOpen={handleOpenMeal} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      <DemoCTA />

      <RecipeDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        meal={selectedMeal}
      />
    </div>
  );
}

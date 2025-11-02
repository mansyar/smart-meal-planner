import DemoDashboard from "@/components/demo/DemoDashboard";
import demoMealPlan from "@/data/demo-meal-plan";

export const metadata = {
  title: "Demo — 7-Day Meal Plan",
};

export default function DemoPage() {
  return <DemoDashboard demoMealPlan={demoMealPlan} />;
}

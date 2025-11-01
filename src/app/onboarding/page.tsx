import React from "react";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Onboarding - AI Meal Planner",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen p-8">
      <OnboardingWizard />
    </main>
  );
}

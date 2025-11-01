import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard - AI Meal Planner",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-semibold mb-4">Dashboard — Coming Soon</h1>
        <p className="text-muted-foreground mb-6">
          This is a placeholder dashboard page. Core features (meal plans,
          recipes, shopping lists) will be available after completing the
          onboarding flow.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="inline-block rounded-md bg-slate-900 text-white px-4 py-2 hover:opacity-90"
          >
            Home
          </Link>
          <Link
            href="/onboarding"
            className="inline-block rounded-md border border-slate-200 px-4 py-2 hover:bg-slate-50"
          >
            Go to Onboarding
          </Link>
        </div>
      </div>
    </main>
  );
}

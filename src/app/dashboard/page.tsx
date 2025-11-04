import { UserDashboard } from "@/components/dashboard/UserDashboard";

export const metadata = {
  title: "Dashboard - AI Meal Planner",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <UserDashboard />
    </main>
  );
}

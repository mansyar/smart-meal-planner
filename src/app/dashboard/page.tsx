import { UserDashboard } from "@/components/dashboard/UserDashboard";

export const metadata = {
  title: "Dashboard - AI Meal Planner",
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <UserDashboard />
    </main>
  );
}

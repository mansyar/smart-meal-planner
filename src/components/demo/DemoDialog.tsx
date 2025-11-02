"use client";

import Link from "next/link";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DemoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline">
          Try Demo Plan
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>View Demo Meal Plan</DialogTitle>
          <DialogDescription>
            See a sample 7-day balanced meal plan (~2000 cal/day). Sign up to
            create and save your own customized plans.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            This demo includes:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
            <li>7-day balanced meal plan (breakfast, lunch, dinner)</li>
            <li>Full recipes with ingredients, instructions, and nutrition</li>
            <li>Sign up prompts to save, swap meals, and export</li>
          </ul>
        </div>

        <DialogFooter>
          <Link href="/demo">
            <Button className="bg-gradient-to-r from-orange-600 to-green-600 text-white">
              View Demo Plan
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

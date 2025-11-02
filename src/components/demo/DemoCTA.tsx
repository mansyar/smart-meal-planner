"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoCTA() {
  return (
    <div className="mt-10 rounded-lg bg-gradient-to-r from-orange-50 to-green-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-900">Like this plan?</h3>
      <p className="mt-2 text-sm text-gray-700">
        Sign up to create and save personalized meal plans, swap meals, and
        export PDFs.
      </p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Link href="/signup">
          <Button className="bg-gradient-to-r from-orange-600 to-green-600 text-white">
            Sign up — it&apos;s free
          </Button>
        </Link>
        <Link href="/signup?plan=premium">
          <Button variant="outline">See Premium</Button>
        </Link>
      </div>
    </div>
  );
}

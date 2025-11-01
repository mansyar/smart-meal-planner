"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

/**
 * Minimal sign-out button for manual testing.
 * Calls POST /api/auth/sign-out (compat endpoint delegates to better-auth).
 */

export const SignOutButton: React.FC<React.ComponentProps<"div">> = (props) => {
  const router = useRouter();

  async function handleSignOut() {
    try {
      // Prefer documented client method if available
      if (typeof signOut === "function") {
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.success("Signed out");
              router.push("/login");
            },
            onError: () => {
              toast.error("Sign out failed");
            },
          },
        });
        return;
      }

      // Fallback: call the sign-out endpoint directly
      const resp = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!resp.ok) {
        toast.error("Sign out failed");
        return;
      }
      toast.success("Signed out");
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Sign out failed");
    }
  }

  return (
    <div {...props}>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  );
};

export default SignOutButton;

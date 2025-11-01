"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { checkProfileExists } from "@/actions/profile";
import { toast } from "sonner";

type FormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignupClient: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    try {
      if (values.password !== values.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Use better-auth client API for email/password signup
      const res = await signUp.email({
        email: values.email,
        // Provide a minimal `name` value to satisfy the client's type requirements.
        // Use the local part of the email as a sensible default.
        name: values.email.split("@")[0] || values.email,
        password: values.password,
      });

      if (res && typeof (res as Record<string, unknown>).error === "string") {
        toast.error(
          ((res as Record<string, unknown>).error as string) || "Signup failed",
        );
        return;
      }

      // Check for existing profile using server action
      const { hasProfile } = await checkProfileExists();

      // If the user has a profile, go to dashboard; otherwise onboarding.
      if (hasProfile) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error(err);
      toast.error("Signup failed");
    }
  }

  function handleGoogleSignup() {
    // Redirect to Better Auth social authorize endpoint for Google
    window.location.href = "/api/auth/authorize/google";
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Sign up with your email to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email", { required: true })}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password", { required: true, minLength: 8 })}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  {...register("confirmPassword", {
                    required: true,
                    minLength: 8,
                  })}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Sign up"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleSignup}
                >
                  Sign up with Google
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Log in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupClient;

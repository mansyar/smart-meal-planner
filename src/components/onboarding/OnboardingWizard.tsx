"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { saveProfile } from "@/actions/profile";

const schema = z.object({
  dietType: z.string().min(1, "Select a diet type"),
  allergies: z.string().optional(),
  calorieGoal: z.coerce
    .number()
    .min(500, "Calorie goal too low")
    .max(10000, "Calorie goal too high"),
});

type FormSchema = z.infer<typeof schema>;

const DIET_OPTIONS = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto" },
  { value: "halal", label: "Halal" },
  { value: "paleo", label: "Paleo" },
];

export default function OnboardingWizard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormSchema>({
    // zodResolver typing can be strict when using `z.coerce` — use a typed resolver wrapper
    resolver: zodResolver(schema) as unknown as Resolver<FormSchema>,
    defaultValues: {
      dietType: "",
      allergies: "",
      calorieGoal: 2000,
    },
  });

  // If session becomes available we could prefill values later (not implemented)
  useEffect(() => {
    if (!session) {
      // no session — show a friendly notice (user can still be redirected manually)
      // Do not auto-redirect here; allow user to click login if needed.
    }
  }, [session]);

  function next() {
    setStep((s) => Math.min(2, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleNext() {
    // Validate current step fields before advancing.
    try {
      console.log("Onboarding: attempt to advance from step", step);
      if (step === 0) {
        const ok = await trigger("dietType");
        if (ok) {
          console.log("Onboarding: diet validated -> advancing to next step");
          try {
            toast.success("Diet selected");
          } catch {}
          next();
        } else {
          console.log("Onboarding: diet validation failed");
          try {
            toast.error("Please select a diet");
          } catch {}
        }
        return;
      }
      if (step === 1) {
        // allergies is optional, but run validation to surface any issues
        const ok = await trigger("allergies");
        if (ok) {
          console.log(
            "Onboarding: allergies validated -> advancing to next step",
          );
          try {
            toast.success("Allergies noted");
          } catch {}
          next();
        } else {
          console.log("Onboarding: allergies validation failed");
          try {
            toast.error("Please check allergies input");
          } catch {}
        }
        return;
      }
    } catch (err) {
      // ignore validation exception and keep user on current step
      console.error("Validation error on step advance:", err);
      try {
        toast.error("Validation error, please try again");
      } catch {}
    }
  }

  async function onSubmit(values: FormSchema) {
    if (!session || !session.user || !session.user.id) {
      toast.error("You must be signed in to complete onboarding.");
      return;
    }

    try {
      console.log("Onboarding: submitting profile values", values);
      // Inform user that save is in progress (non-blocking)
      try {
        toast("Saving preferences...");
      } catch {}

      const result = await saveProfile({
        dietType: values.dietType,
        allergies: values.allergies,
        calorieGoal: Number(values.calorieGoal),
      });

      console.log("Onboarding: saveProfile result", result);

      if (!result.success) {
        toast.error(result.error || "Failed to save preferences");
        return;
      }

      toast.success("Preferences saved");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save preferences");
    }
  }

  const currentDiet = watch("dietType");

  const formRef = useRef<HTMLFormElement | null>(null);

  // Log step transitions to help diagnose unexpected navigation
  useEffect(() => {
    console.log("Onboarding: step changed", step);
  }, [step]);

  // Attach a form submit listener to capture unexpected submissions and their event origin.
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const handler = (ev: Event) => {
      try {
        // Log minimal info to avoid circular JSON issues
        console.log("Onboarding: form submit event captured", {
          type: ev && (ev as Event).type,
          step,
        });
      } catch {
        console.log(
          "Onboarding: form submit event captured (could not serialize event)",
          step,
        );
      }
    };
    el.addEventListener("submit", handler);
    return () => el.removeEventListener("submit", handler);
  }, [step, formRef]);

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)} {...props}>
      <h2 className="text-2xl font-semibold mb-4">
        Onboarding — Tell us about your preferences
      </h2>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm">
          <div
            className={cn(
              "px-3 py-1 rounded",
              step === 0 ? "bg-slate-900 text-white" : "bg-slate-100",
            )}
          >
            1. Diet
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded",
              step === 1 ? "bg-slate-900 text-white" : "bg-slate-100",
            )}
          >
            2. Allergies
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded",
              step === 2 ? "bg-slate-900 text-white" : "bg-slate-100",
            )}
          >
            3. Calories
          </div>
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          // Centralize submission behaviour:
          // - For intermediate steps, run the same validation flow as the Next button.
          // - For final step, run react-hook-form's handleSubmit to validate & submit.
          e.preventDefault();
          if (step < 2) {
            // Use the same programmatic validation as the Next button.
            handleNext();
            return;
          }
          // Final submission
          handleSubmit(onSubmit)();
        }}
        onKeyDown={(e) => {
          // Prevent Enter from submitting the form on intermediate steps.
          if (e.key === "Enter" && step < 2) {
            e.preventDefault();
          }
          // Prevent accidental Enter submission on final step; require explicit click.
          if (e.key === "Enter" && step === 2) {
            e.preventDefault();
          }
        }}
        className="space-y-6"
      >
        {step === 0 && (
          <section>
            <Label>Diet Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {DIET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("dietType", opt.value)}
                  className={cn(
                    "border rounded p-3 text-left",
                    currentDiet === opt.value
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200",
                  )}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {opt.value}
                  </div>
                </button>
              ))}
            </div>
            {errors.dietType && (
              <p className="text-red-600 mt-2 text-sm">
                {errors.dietType.message}
              </p>
            )}
          </section>
        )}

        {step === 1 && (
          <section>
            <Label>Allergies (comma-separated)</Label>
            <Input
              placeholder="e.g. dairy, nuts"
              {...register("allergies")}
              className="mt-2"
            />
            {errors.allergies && (
              <p className="text-red-600 mt-2 text-sm">
                {errors.allergies?.message as string}
              </p>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <Label>Daily Calorie Goal</Label>
            <Input
              type="number"
              {...register("calorieGoal", { valueAsNumber: true })}
              className="mt-2"
              placeholder="e.g. 2000"
            />
            {errors.calorieGoal && (
              <p className="text-red-600 mt-2 text-sm">
                {errors.calorieGoal.message}
              </p>
            )}
          </section>
        )}

        <div className="flex justify-between items-center">
          <div>
            {step > 0 && (
              <Button
                variant="outline"
                type="button"
                onClick={back}
                className="mr-2"
              >
                Back
              </Button>
            )}
          </div>

          <div>
            {step < 2 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Saving..." : "Finish Onboarding"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

# 📝 Product Requirements Document (PRD) — AI Meal Planner

**Project Name:** AI Meal Planner  
**Tech Stack:** Next.js 15, shadcn/ui, TypeScript, PostgreSQL (Prisma), Better Auth, AI API, Nutrition API, Cloudflare R2  
**Target Users:** Health-conscious individuals, busy professionals, and premium users who want automated meal planning

---

## 1. Purpose

The AI Meal Planner app helps users generate personalized weekly meal plans based on dietary preferences, allergies, and calorie goals. It includes AI-generated recipe suggestions, meal swapping, shopping lists, and premium PDF export functionality.

---

## 2. Goals & Objectives

- Provide **personalized meal plans** quickly via AI.
- Allow **meal swaps** for flexibility and preference adjustments.
- Generate **shopping lists** automatically and allow edits.
- Support **guest users** with a demo plan.
- Offer **premium features** such as unlimited meal plans and PDF export.
- Ensure **mobile-first design**, responsive layout, and accessible components.
- Allow **future enhancements**: family profiles, shareable links, notifications.

---

## 3. User Roles

- **Guest / Anonymous:** Can generate one demo meal plan, view recipes, and see the shopping list. Cannot save or export.
- **Registered User:** Can save weekly meal plans, swap meals, edit shopping list, and stream AI results.
- **Premium User:** All registered user features plus unlimited plans/swaps, PDF export, and future advanced features such as family profiles.

---

## 4. Features & Requirements

### 4.1 Core Features (MVP)

1. **Authentication & Onboarding**
   - Sign up / Login via Better Auth (email/password + Google)
   - Onboarding wizard for diet type, allergies, calorie goals

2. **Meal Plan Generation**
   - Generate weekly meal plans using AI API
   - Stream meals to frontend for fast user experience
   - Display meals in a dashboard with tabs for each day

3. **Recipe Details**
   - View ingredients, steps, nutrition facts
   - Open recipe details in a Drawer or Dialog
   - Swap individual meals using AI API

4. **Shopping List**
   - Auto-generate from meal plan
   - Editable quantities and check-off items
   - Persist in PostgreSQL

5. **Premium PDF Export**
   - Export meal plan and shopping list as PDF
   - Store in Cloudflare R2 and return download link

6. **Profile / Settings**
   - Update diet type, allergies, calorie goal
   - Link to Better Auth account settings for email and password changes

### 4.2 Additional Features (Optional / Phase 2)

- Family or multi-user profiles
- Shareable meal plan links
- Notifications via app or email
- Analytics dashboard for user insights

---

## 5. Recent Technical Changes (Milestone 3 → Hardened AI + Storage normalization)

Summary

- Hardened AI outputs with JSON schema validation (Zod) and retry/backoff logic to handle intermittent non-JSON responses from Gemini.
- Normalized recipe storage to structured JSON (Postgres jsonb) for `ingredients`, `instructions`, and `nutritionData`. New fields added: `description`, `prepTimeMinutes`, `cookTimeMinutes`, `servings`.
- Added `src/lib/normalize.ts` to provide a single normalization utility that reads both legacy string fields and new JSON columns and returns a consistent recipe shape for the UI.
- Aligned meal-type enumerations across layers (types, server actions, UI components) to avoid mismatches.
- Implemented optimistic UI update for meal swaps: server action returns normalized recipe shape and the UI applies optimistic update while DB write completes.
- Added callGeminiJSON helper in `src/lib/ai.ts` (Zod validation + retries + JSON extraction from fences) to make AI outputs resilient.

Implications for product behaviour

- New meal creation and AI flows now persist structured recipe objects (JSON) for richer data and easier future features (shopping-list aggregation, PDF export).
- Existing rows using legacy string columns are handled by normalization utilities; no immediate UI break for older data.
- Swap flow feels more responsive due to optimistic updates; eventual consistency is applied when DB commit returns.

Data migration notes (developer & ops)

- A safe migration file was generated at:
  - `prisma/migrations/20251107105000_recipes_json_fields/migration.sql`
- The migration:
  - Adds temporary nullable `jsonb` columns (ingredients_json, instructions_json, nutritionData_json).
  - Backfills parsed JSON where possible (JSON cast if starts with `[` or `{`), falls back to comma-split for arrays and `{}` for objects.
  - Exposes a preview SELECT to review rows that used fallbacks or failed parsing.
  - Includes a commented RENAME/DROP block to run after verification.

Recommended migration workflow (staging → production)

1. Take DB backup in production.
2. Apply migration in staging and run the preview SELECT in the migration SQL to inspect problematic rows.
3. Manually fix rows where the parser produced empty fallbacks, if necessary.
4. After verification, run the rename/drop block to swap in the new JSON columns.
5. Run `npx prisma generate`, `pnpm -w -s run tsc --noEmit`, and run tests.

Quick commands (local/dev)

```bash
# Regenerate client and type-check
npx prisma generate && pnpm -w -s run tsc --noEmit

# Apply migrations in dev (interactive)
npx prisma migrate dev

# Non-interactive deploy (production)
npx prisma migrate deploy
```

Developer guidance

- Use `normalizeRecipeDb` from `src/lib/normalize.ts` whenever returning recipes to the frontend. This ensures a stable shape across legacy and new rows.
- When inserting new recipes from AI or user input, write structured JSON fields directly (no stringified JSON).
- Keep Zod schemas in `src/types/schemas.ts` in sync with the recipe shape used in server actions and `callGeminiJSON` validation.
- Ensure meal-type enums are imported from a single source (prefer `src/types/meal-plan.ts`) to avoid mismatches.

Risks & mitigation

- Risk: Some legacy string fields may contain malformed JSON or ambiguous comma-separated text; preview SELECT helps find these before renaming columns.
- Mitigation: Run migration in staging, inspect preview output, and if needed write manual correction scripts before final rename.

---

## 6. User Stories

(unchanged — see earlier section)

---

## 7. User Flows

(unchanged — see earlier section)

---

## 8. Non-Functional Requirements

(unchanged — see earlier section)

---

## 9. Wireframes & Components (shadcn/ui)

(unchanged — see earlier section)

---

## 10. Milestones

(unchanged — see earlier section; Milestone 3 includes the hardening & migration work described above)

---

## 11. Success Metrics

- Guest can generate one demo plan without error
- Registered users can save and swap meals (swap is optimistic in UI and persists to DB)
- Shopping lists are editable and persist
- Premium users can export PDFs
- AI streaming remains smooth; AI outputs are validated before use
- App is fully responsive and accessible

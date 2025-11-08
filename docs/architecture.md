# 🏗 AI Meal Planner — Architecture Document

**Project Name:** AI Meal Planner  
**Tech Stack:** Next.js 15, shadcn/ui, TypeScript, PostgreSQL (Prisma), Better Auth, AI API, Nutrition API, Cloudflare R2  
**Hosting:** VPS with Coolify  
**File Storage:** Cloudflare R2

---

## 1. Overview

The AI Meal Planner is a web application that generates personalized weekly meal plans based on user preferences, allergies, and calorie goals. It provides AI-generated recipes, meal swaps, shopping lists, and premium PDF export features. The architecture is designed to support a solo developer while remaining scalable and maintainable.

---

## 2. Architecture Layers

### 2.1 Frontend (Client)

- Next.js 15 app directory (Server Components + Server Actions).
- UI components: shadcn/ui.
- Responsibilities:
  - Render pages and components, handle user input.
  - Stream AI responses to the UI for immediate feedback.
  - Trigger server actions (generate meal plans, swap meals, export PDF).
  - Apply optimistic UI updates for fast interactions (e.g., swap meal).

### 2.2 Backend / Server Actions

- Implemented as Next.js 15 Server Actions.
- Responsibilities:
  - Call AI providers for meal generation and swaps.
  - Perform nutrition lookups and validations.
  - Persist data via Prisma → PostgreSQL.
  - Generate PDFs and upload to Cloudflare R2.
  - Enforce auth and premium feature checks.
- Resilience improvements:
  - AI responses are validated with Zod schemas.
  - callGeminiJSON helper implements extraction, validation, and retry/backoff logic to handle occasional non-JSON outputs from Gemini or transient errors.
  - Server actions use normalizers to accept both legacy and new DB formats.

### 2.3 Database Layer

- PostgreSQL managed by Prisma.
- Key design decisions:
  - Recipes now use structured JSON (jsonb) columns for `ingredients`, `instructions`, and `nutritionData`.
  - Additional recipe fields added: `description`, `prepTimeMinutes`, `cookTimeMinutes`, `servings`.
  - Legacy rows with string fields are handled by a normalization utility at read time to provide a stable API shape to the UI.

### 2.4 File Storage Layer

- Cloudflare R2 for PDFs and recipe images (if applicable).

### 2.5 Hosting / Deployment

- VPS + Coolify for deployments.
- Use environment variables for secrets and API keys.
- Run non-interactive migrations in production with `npx prisma migrate deploy`.

---

## 3. Recent Technical Changes (Milestone 3 → Hardened AI + Storage normalization)

Summary

- AI output hardening:
  - Introduced `callGeminiJSON` (in `src/lib/ai.ts`) which:
    - Extracts JSON blocks from model output (removes fences).
    - Attempts to parse JSON and validate shape with Zod schemas in `src/types/schemas.ts`.
    - Retries on parse/validation failures with exponential backoff (configurable attempts).
  - This reduces runtime errors caused by occasional non-JSON AI outputs while preserving reliability.

- Storage normalization:
  - Migrated recipe storage design to structured `jsonb` columns for `ingredients`, `instructions`, and `nutritionData`.
  - New optional recipe fields added: `description`, `prepTimeMinutes`, `cookTimeMinutes`, `servings`.
  - Added normalization utilities (`src/lib/normalize.ts`) to read legacy string columns and return a consistent shape to the frontend; writes use the structured JSON fields.

- UI/UX changes:
  - Swap flow now returns a normalized recipe payload from the server action and the UI applies an optimistic update while the DB write completes.
  - Meal-type enums aligned across types, server actions, and UI components to prevent mismatches.

Migration artifact

- A recommended, safe Postgres migration SQL file was created at:
  - `prisma/migrations/20251107105000_recipes_json_fields/migration.sql`
- Migration approach:
  - Add temporary nullable jsonb columns (`ingredients_json`, `instructions_json`, `nutritionData_json`).
  - Backfill parsed data using helpers that attempt JSON casting and fallback parsing (comma-split fallback for arrays).
  - Provide a preview SELECT for rows that fell back to defaults or failed parsing so team can inspect and correct problematic rows.
  - After verification, rename/drop legacy columns and move jsonb columns into place.

Recommended migration workflow

1. Backup production DB.
2. Apply migration in staging and run the preview SELECT in the migration SQL to inspect any fallback rows.
3. Correct problematic rows manually if needed (or update parsed columns).
4. Run rename/drop block once verified.
5. Run `npx prisma generate && pnpm -w -s run tsc --noEmit` and run tests.
6. Deploy migration to production with `npx prisma migrate deploy`.

---

## 4. System Interactions (unchanged core flows)

### 4.1 Meal Plan Generation Flow

1. User submits preferences on frontend.
2. Server action calls AI API via `callGeminiJSON`.
3. Streaming response/parsed plan returned to frontend and optionally saved to DB.

### 4.2 Recipe Swap Flow

1. User requests a swap.
2. Server action calls AI API for alternatives and validates with Zod.
3. Server creates a new Recipe (structured JSON) and updates the Meal; returns normalized recipe.
4. UI applies optimistic update and reconciles after server response.

### 4.3 Shopping List Flow

- Shopping list generation will benefit from structured recipe JSON (aggregations and deduplication are simpler and more accurate).

### 4.4 PDF Export Flow

- Backend generates PDF from structured data and uploads to Cloudflare R2.

---

## 5. Security & Authentication

- Better Auth handles auth flows.
- Server actions must validate inputs and check permissions before performing DB writes (swap/create).
- Do not expose secret keys or API tokens to client bundles.

---

## 6. Scalability & Operational Notes

- Structured JSON makes aggregation (shopping list generation, nutrition sums) easier at DB level.
- Monitor AI API error/latency rates and add circuit-breaking or rate-limiting if needed.
- Use staging and preview steps for migrations to avoid data loss.

---

## 7. Monitoring & Logging

- Log AI validation failures and retry attempts to help tune prompt/schema.
- Track migration preview reports to identify common malformed legacy rows.
- Add alerts for failed migrations or repeated AI parse errors.

---

## 8. Developer Guidance & Conventions

- Single source of truth for meal-type enums: import from `src/types/meal-plan.ts`.
- Use `normalizeRecipeDb` for all read paths that return recipe data to the frontend.
- When accepting AI-generated content, always validate with Zod before persisting.
- New code that writes recipes should populate structured JSON fields directly.
- Keep Zod schemas and TypeScript types in sync.

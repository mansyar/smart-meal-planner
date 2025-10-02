# AI Meal Planner

Personalized, AI-generated weekly meal plans with recipe details, shopping list automation, and premium PDF export.

## Badges
(Placeholders: CI | License | Coverage | Deploy)

## Overview
AI Meal Planner generates weekly meal plans tailored to dietary preferences, allergies, and calorie targets. The app streams AI results for a fast UX, enables meal swapping, persists data, and offers premium PDF export with Cloudflare R2 storage.

## User Roles
| Role | Capabilities |
|------|--------------|
| Guest | One demo plan, view recipes & shopping list, upgrade prompts |
| Registered | Save plans, swap meals, edit shopping list |
| Premium | Unlimited plans & swaps, PDF export, future premium features |

## Core Features
- AI weekly meal plan generation (streamed)
- Recipe details (ingredients, instructions, nutrition)
- Meal swapping via AI
- Auto-generated editable shopping list
- Profile: diet type, allergies, calorie goal
- Premium: PDF export (Cloudflare R2 storage)

## Tech Stack
- Next.js 15 (App Router, Server Components, Server Actions)
- shadcn/ui + Tailwind CSS
- TypeScript
- Better Auth (authentication)
- Prisma + PostgreSQL (ORM / database)
- AI API (meal generation / swaps)
- Nutrition API (nutrition validation)
- Cloudflare R2 (PDF / optional media storage)
- VPS + Coolify (deployment target)
- Tooling: ESLint, pnpm

## Architecture Summary
Frontend (Next.js app) renders server & client components and triggers server actions to:
- Generate and stream AI meal plans
- Call Nutrition API for validation
- Generate PDFs and upload to Cloudflare R2
- Persist profiles, meal plans, recipes, and shopping lists via Prisma/Postgres

Server actions are thin domain endpoints that orchestrate API calls and DB persistence. Data flow: User → Server Action → AI/Nutrition APIs → Persist (Postgres) → Stream back to user.

## Data Model Snapshot (Prisma)
Primary entities: User, Profile, MealPlan, Meal, Recipe, ShoppingList, ShoppingItem, SocialAccount.  
Relationships (high level):
- User 1–1 Profile
- User 1–N MealPlan
- MealPlan 1–N Meal
- MealPlan 1–1 ShoppingList
- ShoppingList 1–N ShoppingItem
- Meal (optional) references Recipe

For full schema see docs/db-schema.md.

## Project Structure
```
.
├─ docs/
│  ├─ PRD.md
│  ├─ architecture.md
│  ├─ db-schema.md
│  ├─ user-stories-flow.md
│  ├─ ui-wireframe.md
│  └─ milestones.md
├─ src/
│  └─ app/
│     ├─ layout.tsx
│     ├─ page.tsx
│     └─ globals.css
├─ public/
├─ prisma/            # schema.prisma, migrations (not committed in this repo)
├─ next.config.ts
├─ package.json
└─ README.md
```

## Environment Variables (examples)
- DATABASE_URL — Postgres connection string  
- BETTER_AUTH_SECRET — Auth/session secret  
- BETTER_AUTH_GOOGLE_CLIENT_ID / SECRET — Google OAuth (optional)  
- AI_API_KEY — AI generation API key  
- NUTRITION_API_KEY — Nutrition API key  
- R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY — Cloudflare R2 credentials  
- R2_BUCKET — R2 bucket name  
- R2_ENDPOINT — R2 endpoint (if custom)

Adjust names to match actual implementation.

## Getting Started

Prerequisites
- Node 20+ and pnpm
- PostgreSQL instance
- Cloudflare R2 credentials
- AI + Nutrition API keys

Install
```bash
pnpm install
```

Setup environment
- Copy `.env.example` to `.env` and populate required variables.

Database (after adding prisma schema)
```bash
pnpm prisma migrate dev
pnpm prisma generate
```

Run development server
```bash
pnpm dev
```
Open http://localhost:3000

Lint
```bash
pnpm lint
```

## Core Scripts (examples)
- pnpm dev — start development server  
- pnpm build — production build  
- pnpm start — start production server  
- pnpm lint — run linters

Confirm exact scripts in package.json.

## Development Notes
- Server Actions encapsulate backend logic (AI generation, swaps, PDF generation, persistence).
- Streaming UI: meals render as AI responses arrive to improve perceived performance.
- Meal swap updates persist to DB and update the UI.
- Premium PDF flow: generate server-side PDF → upload to R2 → return download link.

## Roadmap (Milestones)
See docs/milestones.md for full milestone breakdown. Key milestones:
0. Project setup
1. Auth + onboarding
2. Guest demo plan
3. Recipe details & swaps
4. Shopping list
5. Premium PDF export
6. Profile / settings
7. UX & accessibility
8. Analytics & monitoring (optional)

## Future Enhancements
- Family / multi-profile support
- Shareable plan links
- Notifications / reminders
- Advanced AI customization (ingredient exclusions)
- Analytics dashboard

## Contributing
Draft phase. Open issues and PRs welcome once base MVP stabilizes.

## License
(Choose and add a license, e.g., MIT)

## Internal Docs
- docs/PRD.md
- docs/architecture.md
- docs/db-schema.md
- docs/user-stories-flow.md
- docs/ui-wireframe.md
- docs/milestones.md

## Acknowledgments
Built with Next.js, shadcn/ui, Prisma, Better Auth, and Cloudflare R2.

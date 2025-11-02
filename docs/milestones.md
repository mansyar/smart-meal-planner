# 🚀 AI Meal Planner — MVP Roadmap & Task Breakdown

**Tech Stack:** Next.js 15, shadcn/ui, PostgreSQL (Prisma), Better Auth, AI API, Nutrition API, Cloudflare R2

---

## Milestone 0 — Project Setup

**Goal:** Initialize project structure, tools, and dependencies.

**Tasks:**

- [x] Initialize a **Next.js 15 project** with TypeScript
- [x] Set up **Tailwind CSS** and **shadcn/ui** components
- [x] Initialize **Prisma** and configure PostgreSQL connection
- [x] Set up **Better Auth** for authentication
- [x] Set up **Cloudflare R2** SDK for file storage integration
- [x] Configure **ESLint / Prettier / Husky** for code quality
- [x] Optional: Set up **VPS + Coolify deployment template** for early testing

**Testable Criteria:**

- Next.js app runs locally without errors
- Tailwind + shadcn/ui components render correctly
- Prisma connects to PostgreSQL and can run migrations
- Better Auth setup allows test registration/login (no frontend yet)
- Cloudflare R2 credentials can be loaded from environment variables

---

## Milestone 1 — Core Authentication & User Onboarding

**Goal:** Enable users to sign up, login, and set preferences.

**Status:** ✅ Completed

**Summary:** Implemented Better Auth (email/password + Google), signup/login pages, cookie-based sessions, onboarding wizard (diet, allergies, calorie goal), and persisted preferences to PostgreSQL via Prisma. Authentication now uses Better Auth defaults with server-side session verification; onboarding uses Next.js server actions for secure profile writes.

**Tasks:**

- [x] Set up authentication with **Better Auth** (email/password + Google login)
- [x] Create **Signup / Login pages** using shadcn/ui components
- [x] Implement **cookie-based sessions**
- [x] Build **Onboarding Wizard** to collect diet type, allergies, and calorie goal
- [x] Store user preferences in **PostgreSQL via Prisma**

**Testable Criteria:**

- Users can register/login successfully
- Cookie session persists across pages
- Preferences are stored and retrievable from DB

---

## Milestone 2 — Guest Demo Meal Plan

**Goal:** Allow anonymous users to view a **static demo meal plan**.

**Status:** ✅ Completed

**Summary:** Implemented a pre-configured 7-day meal plan with realistic recipes, nutrition data, and high-quality images. Added responsive dashboard with tabs, meal cards, and recipe drawer with scrollable content. Applied landing page color palette (orange→green gradient) throughout the UI.

**Tasks:**

- [x] Create static **7-day meal plan** with balanced, realistic recipes
- [x] Build **meal plan dashboard** with day tabs and responsive meal cards
- [x] Implement **recipe drawer** with nutrition table, ingredients/instructions accordion
- [x] Add **royalty-free images** from Unsplash for visual appeal
- [x] Fix **drawer scrolling** to prevent overflow and keep footer accessible
- [x] Apply **orange→green gradient** color palette from landing page

**Testable Criteria:**

- Demo page loads at `/demo` with complete 7-day meal plan
- Meal cards display with gradient badges and hover effects
- Recipe drawer opens with images, nutrition data, and scrollable content
- Accordion sections expand without pushing footer off-screen
- All images load from Unsplash with proper fallbacks

---

## Milestone 3 — Recipe Details & Meal Swap

**Goal:** Enable users to view recipes and swap individual meals.

**Tasks:**

- [ ] Recipe details drawer/modal with accordion for steps and table for nutrition
- [ ] Meal Swap feature using AI API for alternative meals
- [ ] Update meal plan in DB when user swaps meal
- [ ] Reflect updated meals immediately in UI

**Testable Criteria:**

- Clicking a meal opens recipe drawer with full details
- Swap button calls AI API and updates meal in dashboard
- Swapped meals persist in DB for registered users

---

## Milestone 4 — Shopping List

**Goal:** Auto-generate shopping list from meal plan.

**Tasks:**

- [ ] Generate shopping list server-side from recipes
- [ ] Display list in table/accordion with checkboxes and editable quantities
- [ ] Enable check-off items and manual quantity edits
- [ ] Save shopping list in **PostgreSQL**

**Testable Criteria:**

- Shopping list reflects all meals in the plan
- Users can check/uncheck items and edit quantities
- Changes persist in DB for registered users

---

## Milestone 5 — Premium Features: PDF Export

**Goal:** Allow premium users to export meal plan/shopping list as PDF.

**Tasks:**

- [ ] Add **“Export PDF” button** in dashboard/shopping list
- [ ] Generate PDF server-side
- [ ] Upload PDF to **Cloudflare R2**
- [ ] Return downloadable link to frontend (toast/alert for success)

**Testable Criteria:**

- Premium users can export PDFs
- File is uploaded to Cloudflare R2, and URL is accessible
- Guest/non-premium users see prompt to upgrade

---

## Milestone 6 — Profile / Settings

**Goal:** Enable users to update preferences & manage account.

**Tasks:**

- [ ] Profile page with form for diet type, allergies, and calorie goal
- [ ] Link to **Better Auth account settings** (email change, password)
- [ ] Save updates to **PostgreSQL**
- [ ] Load user preferences in meal generation automatically

**Testable Criteria:**

- Changes in profile update meal generation
- Auth settings can be updated and persist in DB
- UI reflects saved preferences immediately

---

## Milestone 7 — UX & Responsiveness

**Goal:** Ensure the app works well across devices and handles AI streaming gracefully.

**Tasks:**

- [ ] Implement **mobile-first layouts** with Tailwind CSS
- [ ] Stream AI responses with skeleton loaders
- [ ] Add accessibility features (focus states, labels)
- [ ] Test flow from landing → onboarding → meal plan → recipe → shopping list

**Testable Criteria:**

- App is fully functional on mobile and desktop
- AI meal streaming shows partial meals without breaking layout
- All interactive elements are accessible

---

## Milestone 8 — Analytics & Monitoring (Optional MVP)

**Goal:** Track basic user activity for insights.

**Tasks:**

- [ ] Integrate lightweight analytics (PostHog or Coolify metrics)
- [ ] Track: meal plans generated, swaps performed, PDF exports
- [ ] Add optional dashboard for dev only to view metrics

**Testable Criteria:**

- Analytics events fire correctly on meal generation, swaps, PDF exports
- Data is viewable in analytics dashboard

---

### ✅ Notes

- Each milestone builds **incrementally**: Milestone 0 → Milestone 1 → … → Milestone 8
- Each milestone is **testable** with clear success criteria
- Focus first on **MVP core (Milestone 0–5)**; Milestone 6–8 refine UX and add polish

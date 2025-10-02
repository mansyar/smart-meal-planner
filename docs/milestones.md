# 🚀 AI Meal Planner — MVP Roadmap & Task Breakdown

**Tech Stack:** Next.js 15, shadcn/ui, PostgreSQL (Prisma), Better Auth, AI API, Nutrition API, Cloudflare R2  

---

## Milestone 0 — Project Setup
**Goal:** Initialize project structure, tools, and dependencies.

**Tasks:**
- [ ] Initialize a **Next.js 15 project** with TypeScript
- [ ] Set up **Tailwind CSS** and **shadcn/ui** components
- [ ] Initialize **Prisma** and configure PostgreSQL connection
- [ ] Set up **Better Auth** for authentication
- [ ] Set up **Cloudflare R2** SDK for file storage integration
- [ ] Configure **ESLint / Prettier / Husky** for code quality
- [ ] Optional: Set up **VPS + Coolify deployment template** for early testing

**Testable Criteria:**
- Next.js app runs locally without errors  
- Tailwind + shadcn/ui components render correctly  
- Prisma connects to PostgreSQL and can run migrations  
- Better Auth setup allows test registration/login (no frontend yet)  
- Cloudflare R2 credentials can be loaded from environment variables  

---

## Milestone 1 — Core Authentication & User Onboarding
**Goal:** Enable users to sign up, login, and set preferences.

**Tasks:**
- [ ] Set up authentication with **Better Auth** (email/password + Google login)
- [ ] Create **Signup / Login pages** using shadcn/ui components
- [ ] Implement **cookie-based sessions**
- [ ] Build **Onboarding Wizard** to collect diet type, allergies, and calorie goal
- [ ] Store user preferences in **PostgreSQL via Prisma**

**Testable Criteria:**
- Users can register/login successfully  
- Cookie session persists across pages  
- Preferences are stored and retrievable from DB  

---

## Milestone 2 — Guest Demo Meal Plan
**Goal:** Allow anonymous users to generate **1 demo meal plan**.

**Tasks:**
- [ ] Landing page with a **“Try Demo” button**
- [ ] Server Action to call **AI API + Nutrition API** for a sample plan
- [ ] Display **7-day meal plan dashboard** with cards and tabs
- [ ] Stream meal generation for fast UX (skeleton loader during AI streaming)

**Testable Criteria:**
- Guest can generate **1 demo meal plan** without signing up  
- Meals display correctly with placeholders during streaming  
- Recipes can be clicked to view details (Drawer/Dialog opens)  

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

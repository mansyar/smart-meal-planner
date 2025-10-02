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

## 5. User Stories

### Guest / Anonymous
- Generate one demo meal plan
- View recipes and shopping list
- Prompted to register for saving or exporting

### Registered User
- Sign up and log in
- Complete onboarding wizard
- Generate weekly meal plan
- Swap individual meals
- Edit and check-off shopping list items

### Premium User
- Unlimited meal plans and swaps
- Export PDF of meal plans and shopping list
- Access future premium features such as family profiles

---

## 6. User Flows

### Guest Meal Plan Flow
Landing Page → Click "Try Demo" → AI generates 7-day meal plan → View recipes → View shopping list → Prompt to Register/Login

### Registered User Meal Plan Flow
Signup/Login → Onboarding Wizard → Generate Meal Plan → Stream AI results → View recipes → Swap meals → Generate Shopping List → Save plan

### Premium User Flow
Registered User → Upgrade to Premium → Unlimited meal plans → Unlimited swaps → Export PDF → Download from Cloudflare R2

---

## 7. Non-Functional Requirements
- **Performance:** Stream AI results for fast experience
- **Scalability:** VPS-hosted with Cloudflare R2 for storage
- **Accessibility:** All interactive elements labeled and keyboard-navigable
- **Responsiveness:** Mobile-first, fully responsive layouts
- **Security:** HTTPS, Better Auth, minimal personal data storage

---

## 8. Wireframes & Components (shadcn/ui)
- **Landing Page:** Hero section, Try Demo button
- **Auth Pages:** Form, Input, Button, Card
- **Onboarding Wizard:** Stepper, Input, Select, Button
- **Dashboard:** Tabs for days, Meal Cards, Recipe Drawer, Swap Meal Modal
- **Shopping List:** Table or Accordion, Checkbox, Input, Button
- **Profile / Settings:** Form, Input, Select, Button
- **PDF Export:** Button with Toast/Alert for success

---

## 9. Milestones

- **Milestone 0:** Project setup, initialize Next.js 15, Tailwind, shadcn/ui, Prisma, Better Auth, Cloudflare R2  
- **Milestone 1:** Core Authentication & Onboarding  
- **Milestone 2:** Guest Demo Meal Plan  
- **Milestone 3:** Recipe Details & Meal Swap  
- **Milestone 4:** Shopping List  
- **Milestone 5:** Premium Features: PDF Export  
- **Milestone 6:** Profile / Settings  
- **Milestone 7:** UX & Responsiveness  
- **Milestone 8:** Analytics & Monitoring (Optional)

---

## 10. Success Metrics
- Guest can generate one demo plan without error
- Registered users can save and swap meals
- Shopping lists are editable and persist
- Premium users can export PDFs
- AI streaming is smooth and responsive
- App is fully responsive and accessible

---

## 11. Future Enhancements
- Multi-user or family profiles
- Meal plan sharing
- Notifications and reminders
- AI recipe customization (e.g., ingredient exclusions)
- Analytics dashboard for user engagement

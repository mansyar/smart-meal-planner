# 🧩 User Stories & Flows — AI Meal Planner

**Project Name:** AI Meal Planner  
**Tech Stack:** Next.js 15, shadcn/ui, TypeScript, PostgreSQL (Prisma), Better Auth, AI API, Nutrition API, Cloudflare R2  

---

## 1. User Roles

- **Guest / Anonymous:** Can generate one demo meal plan, view recipes, and see the shopping list. Cannot save or export.  
- **Registered User:** Can save weekly meal plans, swap meals, edit shopping list, and stream AI results.  
- **Premium User:** All registered user features plus unlimited plans/swaps, PDF export, and future premium features (e.g., family profiles).  

---

## 2. User Stories

### 2.1 Guest / Anonymous
1. As a guest, I want to generate a demo meal plan so I can explore the app.  
2. As a guest, I want to view recipe details so I can see ingredients and steps.  
3. As a guest, I want to view the generated shopping list so I can see required ingredients.  
4. As a guest, I want to be prompted to register if I want to save or export my meal plan.  

### 2.2 Registered User
1. As a user, I want to sign up and log in using Better Auth.  
2. As a user, I want to complete an onboarding wizard to set diet type, allergies, and calorie goals.  
3. As a user, I want to generate a weekly meal plan that matches my preferences.  
4. As a user, I want to swap individual meals if I don’t like a suggestion.  
5. As a user, I want to edit and check-off items in my shopping list.  
6. As a user, I want all my preferences and meal plans to be saved for future use.  

### 2.3 Premium User
1. As a premium user, I want unlimited meal plans and swaps so I can plan meals as often as I like.  
2. As a premium user, I want to export my meal plan and shopping list as PDF for printing or sharing.  
3. As a premium user, I want access to future premium features, like family profiles and meal sharing.  

---

## 3. User Flows

### 3.1 Guest Meal Plan Flow
**Flow Description:**  
- Guest visits landing page.  
- Clicks “Try Demo” button.  
- Server action calls AI API to generate a 7-day meal plan.  
- Meals are streamed to frontend and displayed in the dashboard.  
- Guest can click on meals to view recipe details.  
- Guest can view the shopping list.  
- Guest is prompted to register/login for saving/exporting.

---

### 3.2 Registered User Meal Plan Flow
**Flow Description:**  
- User signs up or logs in via Better Auth.  
- Completes onboarding wizard with diet type, allergies, and calorie goals.  
- User requests a weekly meal plan.  
- Server action calls AI API to generate meals.  
- Meal plan streams to frontend.  
- User can click on meals to view recipes or swap individual meals.  
- Shopping list is auto-generated and editable.  
- Meal plan and shopping list are saved to PostgreSQL.  

---

### 3.3 Premium User Flow
**Flow Description:**  
- Registered user upgrades to premium.  
- User generates unlimited meal plans and swaps meals as desired.  
- User clicks “Export PDF” button for meal plan and shopping list.  
- Server action generates PDF and uploads to Cloudflare R2.  
- User receives downloadable link for PDF.  

---

## 4. Notes
- Flows are designed to **minimize steps** and reduce friction.  
- Streaming AI responses ensures fast UX and immediate feedback.  
- All user interactions (meal swaps, shopping list edits, PDF export) persist in the database for registered/premium users.  
- Guest users have limited access to encourage registration and premium upgrades.  

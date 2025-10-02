# 🏗 AI Meal Planner — Architecture Document

**Project Name:** AI Meal Planner  
**Tech Stack:** Next.js 15, shadcn/ui, TypeScript, PostgreSQL (Prisma), Better Auth, AI API, Nutrition API, Cloudflare R2  
**Hosting:** VPS with Coolify  
**File Storage:** Cloudflare R2  

---

## 1. Overview
The AI Meal Planner is a web application that generates personalized weekly meal plans based on user preferences, allergies, and calorie goals. It provides AI-generated recipes, meal swaps, shopping lists, and premium PDF export features.  

The architecture is designed to support a **solo developer**, allowing incremental development, testing, and deployment while remaining scalable and maintainable.

---

## 2. Architecture Layers

### 2.1 Frontend (Client)
- Built with **Next.js 15** using **app directory** (server actions and server components).
- **UI components**: shadcn/ui (Button, Card, Input, Tabs, Drawer, etc.)
- **Responsibilities:**
  - Rendering pages and components
  - Handling user input (forms, onboarding wizard)
  - Displaying meal plans, recipes, and shopping lists
  - Streaming AI responses with skeleton loaders
  - Mobile-first, fully responsive design
  - Trigger server actions (generate meal plans, swap meals, export PDF)

### 2.2 Backend / Server Actions
- Handled by **Next.js 15 server actions**.
- **Responsibilities:**
  - Communicate with **AI API** to generate meal plans and swap meals
  - Fetch nutrition data from **Nutrition API**
  - Manage user authentication with **Better Auth**
  - Save and retrieve user data (profiles, meal plans, shopping lists) via **Prisma**
  - Generate PDFs and upload to **Cloudflare R2**
  - Enforce premium feature checks (e.g., PDF export, unlimited swaps)

### 2.3 Database Layer
- **PostgreSQL** managed via **Prisma ORM**
- **Data Models:**
  - User: authentication, roles, email, password
  - Profile: diet type, allergies, calorie goals
  - MealPlan: linked to User, contains list of meals per week
  - Recipe: ingredients, steps, nutrition info
  - ShoppingList: linked to MealPlan, contains items with quantities and status
- Responsibilities:
  - Persist user data and preferences
  - Maintain relationships between meals, recipes, and shopping lists
  - Ensure data integrity and transactional updates

### 2.4 File Storage Layer
- **Cloudflare R2** for storing exported PDFs
- Responsibilities:
  - Accept PDF uploads from backend
  - Generate secure download links
  - Handle storage scaling automatically

### 2.5 Hosting / Deployment
- **VPS** with **Coolify** to manage deployments
- Responsibilities:
  - Serve Next.js app (frontend + server actions)
  - Secure environment variables
  - Integrate with PostgreSQL database
  - Enable SSL/HTTPS (if required in the future)
  - Optional analytics monitoring

---

## 3. System Interactions

### 3.1 Meal Plan Generation Flow
1. User submits preferences (diet type, allergies, calories) via frontend.
2. Server action calls **AI API** to generate meal plan.
3. Nutrition API provides calorie and nutrient validation.
4. Result returned to frontend with streaming for immediate display.
5. Meal plan saved in **PostgreSQL** for registered users.

### 3.2 Recipe Swap Flow
1. User clicks **Swap Meal**.
2. Server action calls AI API to generate alternatives.
3. Updated meal replaces original in meal plan.
4. Database updated to persist the change.

### 3.3 Shopping List Flow
1. Meal plan triggers **shopping list generation** server-side.
2. Frontend displays list with editable quantities and checkboxes.
3. User updates reflected in database immediately.

### 3.4 PDF Export Flow
1. Premium user clicks **Export PDF**.
2. Server action generates PDF from meal plan + shopping list.
3. PDF uploaded to **Cloudflare R2**.
4. Download link returned to frontend.

---

## 4. Security & Authentication
- **Better Auth** handles registration, login, and session management.
- User sessions maintained via secure cookies.
- Sensitive data (passwords, API keys, R2 credentials) stored in environment variables.
- Premium feature access controlled in server actions.
- HTTPS enforced via VPS/Coolify or reverse proxy.

---

## 5. Scalability Considerations
- **Frontend:** Next.js supports server-side rendering and streaming, reducing client load.
- **Database:** PostgreSQL can scale vertically; Prisma enables easy migrations.
- **File Storage:** Cloudflare R2 scales automatically for PDFs.
- **Hosting:** VPS can be upgraded or load-balanced if needed.

---

## 6. Monitoring & Logging
- Optional lightweight analytics (PostHog or Coolify metrics)
- Server-side logging of API calls and errors
- Track success/failure of AI meal generation and PDF exports
- Monitor database performance and R2 upload/download events

---

## 7. Summary Diagram (Conceptual)
**[Text Description Instead of Diagram]**

- **Frontend (Next.js 15 + shadcn/ui)** → interacts with → **Server Actions (Next.js 15)**  
- **Server Actions** communicate with:
  - **AI API** (meal plan generation)
  - **Nutrition API** (nutrition validation)
  - **Prisma / PostgreSQL** (user data, meal plans, shopping lists)
  - **Cloudflare R2** (PDF storage)
- **User Roles:** Guest / Registered / Premium determine access to features
- Hosting via **VPS + Coolify**, secure and scalable

---

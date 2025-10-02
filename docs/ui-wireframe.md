# 🖼 UI Wireframes & Component Map — AI Meal Planner

**Tech Stack:** Next.js 15, shadcn/ui, Tailwind CSS

---

## 1. Pages & Screens

| Page / Screen          | Description | Key Components (shadcn/ui) |
|------------------------|------------|----------------------------|
| Landing Page           | Hero section, explanation, demo plan button | `Button`, `Card`, `Hero`, `Typography` |
| Signup / Login         | Email/password + Google login | `Form`, `Input`, `Button`, `Card` |
| Onboarding Wizard      | Step-by-step diet, allergies, calorie goal | `Form`, `Stepper`, `Input`, `Select`, `Button` |
| Meal Plan Dashboard    | 7-day meal plan, swipe/stream AI-generated meals | `Card`, `Tabs` (for days), `Drawer` / `Dialog` for recipe details, `Button` for swaps |
| Recipe Details         | Ingredients, instructions, nutrition, optional image | `Drawer` or `Dialog`, `Card`, `Accordion` for steps, `Image`, `Table` for nutrition |
| Meal Swap Modal        | Suggest alternative meals | `Dialog`, `Card`, `Button` |
| Shopping List          | List of ingredients with check-off, editable quantities | `Table`, `Checkbox`, `Input`, `Accordion`, `Button` |
| Profile / Settings     | Update diet preferences, allergies, auth settings | `Form`, `Input`, `Select`, `Button`, `Card` |
| PDF Export / Download  | Button to export meal plan/shopping list | `Button`, optional `Toast` / `Alert` for success |

---

## 2. Component Map

### 2.1 Cards
- **Use:** Meal cards, recipe cards, dashboard tiles  
- **Props:** title, image (optional), meal type, calories  

### 2.2 Form / Input
- **Use:** Signup, login, onboarding, profile settings  
- **Props:** `Input` (text, email, number), `Select` (diet type, allergies), `Checkbox` (allergies)  

### 2.3 Drawer / Dialog
- **Use:** Recipe details, meal swap modal  
- **Props:** title, content, actions (buttons)  
- **Behavior:** Open on click, close on overlay or close button  

### 2.4 Tabs
- **Use:** Meal Plan Dashboard (days of the week)  
- **Props:** Tab label (day), tab content (meals/cards)  

### 2.5 Table / Accordion
- **Use:** Shopping list, nutrition details, expandable recipe steps  
- **Props:** rows (ingredients/items), editable inputs for quantity, checkboxes for bought items  

### 2.6 Buttons
- **Use:** Generate plan, swap meal, export PDF, save plan, navigate wizard steps  
- **Props:** `variant` (primary, secondary), `size` (sm, md, lg), `icon` (optional)  

### 2.7 Stepper
- **Use:** Onboarding wizard  
- **Props:** step labels, current step, navigation buttons  

### 2.8 Typography
- **Use:** Headings, labels, instructions, alerts  
- **Props:** size, weight, color, alignment  

### 2.9 Image
- **Use:** Recipe images  
- **Props:** src (Cloudflare R2 URL), alt, width, height, optional lazy-loading  

### 2.10 Toast / Alert
- **Use:** Success/error notifications (e.g., PDF export complete)  
- **Props:** variant (success, error), message, duration  

---

## 3. Navigation / Flow Map

```mermaid
flowchart TD
    A[Landing Page] -->|Click Demo| B[Meal Plan Dashboard]
    A -->|Signup/Login| C[Signup/Login] --> D[Onboarding Wizard] --> B
    B --> E[Recipe Details Drawer/Dialog]
    E --> F[Meal Swap Modal]
    B --> G[Shopping List Table/Accordion]
    B --> H[PDF Export Button]
    B --> I[Profile / Settings Page]


Notes:

Guest users: A → B (demo)

Registered users: A → C → D → B

Premium users: can export PDF (H) and have unlimited swaps (F)
```

## 4. UX Notes

- Streaming AI Responses: Display meals as they arrive (skeleton loaders).
- Responsive Design: Mobile-first; Cards stack vertically on mobile, grid on desktop.
- Accessibility: Ensure forms and buttons have proper labels & focus states.
- Future Enhancements: Family profiles could add additional tabs per member in dashboard.
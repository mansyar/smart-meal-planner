```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// --------------------
/// Better Auth Models
/// --------------------

model User {
  id             String     @id @default(cuid())
  email          String     @unique
  emailVerified  Boolean    @default(false)
  passwordHash   String?
  isPremium      Boolean    @default(false)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  // Relations
  profile        Profile?
  mealPlans      MealPlan[]

  // Optional social login linking
  socialAccounts SocialAccount[]
}

model SocialAccount {
  id        String  @id @default(cuid())
  provider  String
  providerId String
  user      User    @relation(fields: [userId], references: [id])
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

/// --------------------
/// Profile / Preferences
/// --------------------
model Profile {
  id            String   @id @default(cuid())
  user          User     @relation(fields: [userId], references: [id])
  userId        String   @unique
  dietType      String?  // e.g., keto, vegetarian, halal
  allergies     String?  // comma-separated list
  calorieGoal   Int?     // daily calories
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

/// --------------------
/// Meal Plans
/// --------------------
model MealPlan {
  id           String     @id @default(cuid())
  user         User       @relation(fields: [userId], references: [id])
  userId       String
  weekStart    DateTime   // start date of the week
  meals        Meal[]     // relation to Meal
  shoppingList ShoppingList?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

/// --------------------
/// Individual Meals
/// --------------------
model Meal {
  id           String     @id @default(cuid())
  mealPlan     MealPlan   @relation(fields: [mealPlanId], references: [id])
  mealPlanId   String
  dayOfWeek    Int        // 1=Monday, 7=Sunday
  type         String     // breakfast, lunch, dinner, snack
  recipe       Recipe?    @relation(fields: [recipeId], references: [id])
  recipeId     String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

/// --------------------
/// Recipes
/// --------------------
model Recipe {
  id            String     @id @default(cuid())
  title         String
  ingredients   String     // JSON string or comma-separated
  instructions  String
  nutritionData String     // JSON string: calories, protein, carbs, fat
  imageUrl      String?    // optional image stored in Cloudflare R2
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relation
  meals         Meal[]
}

/// --------------------
/// Shopping List
/// --------------------
model ShoppingList {
  id           String     @id @default(cuid())
  mealPlan     MealPlan   @relation(fields: [mealPlanId], references: [id])
  mealPlanId   String     @unique
  items        ShoppingItem[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model ShoppingItem {
  id             String     @id @default(cuid())
  shoppingList   ShoppingList @relation(fields: [shoppingListId], references: [id])
  shoppingListId String
  name           String
  quantity       String     // e.g., "2 cups", "500g"
  category       String?    // e.g., Fruits, Meats, Spices
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}
```

---

### ✅ Notes on Schema
- **Better Auth**: `User` + `SocialAccount` models match Better Auth expectations.  
- **Profile**: Stores dietary preferences, allergies, calorie goal.  
- **MealPlan**: Weekly plan linked to multiple `Meal` entries.  
- **Meal**: Each meal links to a `Recipe`.  
- **Recipe**: Ingredients, instructions, nutrition, optional Cloudflare R2 image URL.  
- **ShoppingList**: Linked to `MealPlan`, contains multiple `ShoppingItem`s.  

---
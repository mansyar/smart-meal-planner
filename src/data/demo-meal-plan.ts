export type DemoMeal = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g?: number;
  };
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  imageUrl?: string;
  mealType?: "breakfast" | "lunch" | "dinner";
};

export type DemoDay = {
  day: string;
  meals: {
    breakfast: DemoMeal;
    lunch: DemoMeal;
    dinner: DemoMeal;
  };
};

// Unsplash images (royalty-free) used as placeholders
const BREAKFAST_IMG =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80";
const LUNCH_IMG =
  "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=1200&q=80";
const DINNER_IMG =
  "https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=1200&q=80";

export const demoMealPlan: DemoDay[] = [
  {
    day: "Monday",
    meals: {
      breakfast: {
        id: "mon-bf-01",
        mealType: "breakfast",
        title: "Overnight Oats with Berries",
        description:
          "Creamy oats soaked overnight with Greek yogurt, topped with mixed berries and a drizzle of honey.",
        ingredients: [
          "1/2 cup rolled oats",
          "1/2 cup low-fat milk (or plant milk)",
          "1/4 cup Greek yogurt",
          "1 tsp honey",
          "1/2 cup mixed berries (strawberries, blueberries)",
          "1 tbsp chia seeds",
        ],
        instructions: [
          "Combine oats, milk, yogurt, honey and chia seeds in a jar.",
          "Refrigerate overnight (6+ hours).",
          "Top with fresh berries before serving.",
        ],
        nutrition: {
          calories: 380,
          protein_g: 15,
          carbs_g: 55,
          fat_g: 8,
          fiber_g: 9,
        },
        prepTimeMinutes: 10,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "mon-lu-01",
        mealType: "lunch",
        title: "Grilled Chicken & Quinoa Salad",
        description:
          "Protein-packed salad with grilled chicken, quinoa, mixed greens, cherry tomatoes and a lemon vinaigrette.",
        ingredients: [
          "120g grilled chicken breast, sliced",
          "1 cup cooked quinoa",
          "2 cups mixed salad greens",
          "6 cherry tomatoes, halved",
          "1/4 cucumber, sliced",
          "1 tbsp olive oil",
          "1 tbsp lemon juice",
          "Salt & pepper to taste",
        ],
        instructions: [
          "Assemble mixed greens, quinoa, tomatoes and cucumber in a bowl.",
          "Top with sliced grilled chicken.",
          "Whisk olive oil, lemon juice, salt and pepper; drizzle over salad.",
        ],
        nutrition: {
          calories: 520,
          protein_g: 38,
          carbs_g: 45,
          fat_g: 16,
          fiber_g: 6,
        },
        prepTimeMinutes: 15,
        cookTimeMinutes: 10,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "mon-di-01",
        mealType: "dinner",
        title: "Baked Salmon with Roasted Vegetables",
        description:
          "Simple baked salmon fillet served with a medley of roasted seasonal vegetables and lemon.",
        ingredients: [
          "150g salmon fillet",
          "1 cup broccoli florets",
          "1/2 red bell pepper, sliced",
          "1 small sweet potato, cubed",
          "1 tbsp olive oil",
          "1 tsp dried thyme",
          "Lemon wedge, salt & pepper",
        ],
        instructions: [
          "Preheat oven to 200°C (400°F). Toss vegetables in olive oil, thyme, salt and pepper and roast for 20–25 minutes.",
          "Season salmon with salt & pepper, bake for 12–15 minutes until cooked through.",
          "Serve salmon with roasted vegetables and a squeeze of lemon.",
        ],
        nutrition: {
          calories: 650,
          protein_g: 40,
          carbs_g: 45,
          fat_g: 28,
          fiber_g: 7,
        },
        prepTimeMinutes: 10,
        cookTimeMinutes: 25,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
  {
    day: "Tuesday",
    meals: {
      breakfast: {
        id: "tue-bf-01",
        mealType: "breakfast",
        title: "Greek Yogurt Parfait",
        description:
          "Layered Greek yogurt with granola, sliced banana and a sprinkle of nuts.",
        ingredients: [
          "3/4 cup Greek yogurt",
          "1/3 cup granola (low sugar)",
          "1 small banana, sliced",
          "1 tbsp chopped almonds",
          "1 tsp honey (optional)",
        ],
        instructions: [
          "Layer yogurt, granola and banana in a bowl or jar.",
          "Top with chopped almonds and a drizzle of honey if desired.",
        ],
        nutrition: {
          calories: 400,
          protein_g: 22,
          carbs_g: 48,
          fat_g: 12,
          fiber_g: 4,
        },
        prepTimeMinutes: 5,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "tue-lu-01",
        mealType: "lunch",
        title: "Mediterranean Chickpea Bowl",
        description:
          "A vegetarian bowl with roasted chickpeas, couscous, cucumber, olives, feta and tzatziki.",
        ingredients: [
          "1 cup cooked couscous",
          "1/2 cup roasted chickpeas",
          "1/2 cucumber, diced",
          "6 olives, sliced",
          "30g feta cheese",
          "2 tbsp tzatziki or yogurt dressing",
        ],
        instructions: [
          "Assemble couscous, chickpeas, cucumber and olives in a bowl.",
          "Crumble feta on top and add a dollop of tzatziki.",
        ],
        nutrition: {
          calories: 540,
          protein_g: 18,
          carbs_g: 65,
          fat_g: 16,
          fiber_g: 8,
        },
        prepTimeMinutes: 12,
        cookTimeMinutes: 10,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "tue-di-01",
        mealType: "dinner",
        title: "Chicken Stir-Fry with Brown Rice",
        description:
          "Quick stir-fry with colorful vegetables, lean chicken strips and a light soy-ginger sauce over brown rice.",
        ingredients: [
          "120g chicken breast, thinly sliced",
          "1 cup mixed stir-fry vegetables (carrot, snap peas, bell pepper)",
          "1 cup cooked brown rice",
          "1 tbsp soy sauce",
          "1 tsp grated ginger",
          "1 tsp sesame oil",
        ],
        instructions: [
          "Sear chicken in a non-stick pan until golden, remove.",
          "Stir-fry vegetables with ginger and sesame oil until tender-crisp.",
          "Return chicken to pan, add soy sauce, toss and serve over brown rice.",
        ],
        nutrition: {
          calories: 610,
          protein_g: 42,
          carbs_g: 70,
          fat_g: 14,
          fiber_g: 6,
        },
        prepTimeMinutes: 10,
        cookTimeMinutes: 12,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
  {
    day: "Wednesday",
    meals: {
      breakfast: {
        id: "wed-bf-01",
        mealType: "breakfast",
        title: "Avocado Toast with Poached Egg",
        description:
          "Whole-grain toast topped with smashed avocado, chili flakes and a perfectly poached egg.",
        ingredients: [
          "1 slice whole-grain bread, toasted",
          "1/2 ripe avocado",
          "1 egg, poached",
          "Salt, pepper, lemon juice",
          "Chili flakes (optional)",
        ],
        instructions: [
          "Mash avocado with lemon, salt and pepper.",
          "Spread on toast and top with the poached egg.",
          "Sprinkle chili flakes if desired.",
        ],
        nutrition: {
          calories: 420,
          protein_g: 14,
          carbs_g: 30,
          fat_g: 25,
          fiber_g: 7,
        },
        prepTimeMinutes: 8,
        cookTimeMinutes: 4,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "wed-lu-01",
        mealType: "lunch",
        title: "Turkey & Avocado Wrap",
        description:
          "Light wholewheat wrap filled with sliced turkey, avocado, lettuce and a yogurt-based spread.",
        ingredients: [
          "1 wholewheat tortilla",
          "100g sliced turkey breast",
          "1/4 avocado, sliced",
          "Lettuce leaves",
          "1 tbsp plain yogurt mixed with mustard",
        ],
        instructions: [
          "Spread yogurt-mustard mix on tortilla, layer turkey, avocado and lettuce.",
          "Roll tightly, slice in half and serve.",
        ],
        nutrition: {
          calories: 480,
          protein_g: 32,
          carbs_g: 40,
          fat_g: 18,
          fiber_g: 5,
        },
        prepTimeMinutes: 8,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "wed-di-01",
        mealType: "dinner",
        title: "Pasta Primavera",
        description:
          "Pasta tossed with seasonal vegetables, olive oil, garlic and a sprinkle of parmesan.",
        ingredients: [
          "75g whole-grain pasta",
          "1 cup mixed vegetables (zucchini, cherry tomatoes, peas)",
          "1 tbsp olive oil",
          "1 garlic clove, minced",
          "1 tbsp grated parmesan",
        ],
        instructions: [
          "Cook pasta according to package instructions.",
          "Sauté garlic and vegetables in olive oil until tender.",
          "Toss pasta with vegetables and top with parmesan.",
        ],
        nutrition: {
          calories: 620,
          protein_g: 20,
          carbs_g: 80,
          fat_g: 18,
          fiber_g: 8,
        },
        prepTimeMinutes: 10,
        cookTimeMinutes: 12,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
  {
    day: "Thursday",
    meals: {
      breakfast: {
        id: "thu-bf-01",
        mealType: "breakfast",
        title: "Berry Smoothie Bowl",
        description:
          "Blended mixed berries with banana and a scoop of protein powder, topped with seeds and granola.",
        ingredients: [
          "1 cup mixed frozen berries",
          "1/2 banana",
          "1 scoop vanilla protein powder (optional)",
          "1/2 cup almond milk",
          "1 tbsp pumpkin seeds",
          "2 tbsp granola",
        ],
        instructions: [
          "Blend berries, banana, protein powder and almond milk until smooth.",
          "Pour into a bowl and top with seeds and granola.",
        ],
        nutrition: {
          calories: 380,
          protein_g: 20,
          carbs_g: 55,
          fat_g: 8,
          fiber_g: 9,
        },
        prepTimeMinutes: 7,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "thu-lu-01",
        mealType: "lunch",
        title: "Lentil & Veggie Soup with Wholegrain Bread",
        description:
          "Hearty lentil soup loaded with vegetables, served with a slice of wholegrain bread.",
        ingredients: [
          "1 cup cooked lentils",
          "1 carrot, diced",
          "1 celery stalk, diced",
          "1/2 onion, diced",
          "400ml vegetable stock",
          "1 slice wholegrain bread",
        ],
        instructions: [
          "Sauté onion, carrot and celery until softened.",
          "Add lentils and stock, simmer 15–20 minutes.",
          "Season and serve with bread.",
        ],
        nutrition: {
          calories: 500,
          protein_g: 24,
          carbs_g: 70,
          fat_g: 8,
          fiber_g: 16,
        },
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "thu-di-01",
        mealType: "dinner",
        title: "Beef Tacos with Fresh Salsa",
        description:
          "Lean beef tacos with corn tortillas, fresh tomato salsa and shredded lettuce.",
        ingredients: [
          "120g lean ground beef",
          "2 small corn tortillas",
          "1/2 cup shredded lettuce",
          "Fresh salsa (tomato, onion, cilantro, lime)",
          "1 tsp olive oil",
        ],
        instructions: [
          "Cook beef in a pan with seasoning until browned.",
          "Warm tortillas, assemble with beef, lettuce and salsa.",
        ],
        nutrition: {
          calories: 680,
          protein_g: 36,
          carbs_g: 60,
          fat_g: 26,
          fiber_g: 6,
        },
        prepTimeMinutes: 12,
        cookTimeMinutes: 10,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
  {
    day: "Friday",
    meals: {
      breakfast: {
        id: "fri-bf-01",
        mealType: "breakfast",
        title: "Peanut Butter Banana Toast",
        description:
          "Whole grain toast topped with peanut butter, banana slices and chia seeds.",
        ingredients: [
          "1 slice whole-grain bread",
          "1 tbsp peanut butter",
          "1/2 banana, sliced",
          "1 tsp chia seeds",
        ],
        instructions: [
          "Toast bread and spread peanut butter.",
          "Top with banana slices and chia seeds.",
        ],
        nutrition: {
          calories: 420,
          protein_g: 14,
          carbs_g: 50,
          fat_g: 16,
          fiber_g: 6,
        },
        prepTimeMinutes: 5,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "fri-lu-01",
        mealType: "lunch",
        title: "Tuna Niçoise-Inspired Salad",
        description:
          "Tuna with green beans, potatoes, olives, hard-boiled egg and mixed greens with a light vinaigrette.",
        ingredients: [
          "100g canned tuna in water, drained",
          "1/2 cup green beans, blanched",
          "1 small boiled potato, sliced",
          "1 hard-boiled egg, halved",
          "Mixed greens, 6 olives, lemon vinaigrette",
        ],
        instructions: [
          "Arrange greens, potatoes and green beans on a plate.",
          "Top with tuna, egg halves and olives, drizzle with vinaigrette.",
        ],
        nutrition: {
          calories: 560,
          protein_g: 38,
          carbs_g: 40,
          fat_g: 22,
          fiber_g: 6,
        },
        prepTimeMinutes: 15,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "fri-di-01",
        mealType: "dinner",
        title: "Sheet Pan Chicken & Vegetables",
        description:
          "One-pan roasted chicken thighs with a rainbow of vegetables for easy cleanup and bold flavors.",
        ingredients: [
          "2 small chicken thighs (about 150g total)",
          "1 cup mixed vegetables (carrots, zucchini, onions)",
          "1 tbsp olive oil",
          "1 tsp smoked paprika",
        ],
        instructions: [
          "Preheat oven to 200°C (400°F). Toss chicken and vegetables in oil and paprika.",
          "Roast for 25–30 minutes until chicken is cooked and vegetables are tender.",
        ],
        nutrition: {
          calories: 700,
          protein_g: 45,
          carbs_g: 40,
          fat_g: 32,
          fiber_g: 6,
        },
        prepTimeMinutes: 10,
        cookTimeMinutes: 30,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
  {
    day: "Saturday",
    meals: {
      breakfast: {
        id: "sat-bf-01",
        mealType: "breakfast",
        title: "Spinach & Feta Omelette",
        description:
          "Fluffy omelette filled with spinach, feta and a side of cherry tomatoes.",
        ingredients: [
          "2 eggs",
          "1/2 cup spinach, chopped",
          "30g feta cheese",
          "1 tsp olive oil",
          "Cherry tomatoes on the side",
        ],
        instructions: [
          "Whisk eggs and season. Sauté spinach briefly, add eggs and sprinkle feta.",
          "Fold omelette and serve with cherry tomatoes.",
        ],
        nutrition: {
          calories: 360,
          protein_g: 22,
          carbs_g: 6,
          fat_g: 26,
          fiber_g: 2,
        },
        prepTimeMinutes: 8,
        cookTimeMinutes: 5,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "sat-lu-01",
        mealType: "lunch",
        title: "Quinoa & Roasted Veggie Bowl",
        description:
          "Warm quinoa bowl topped with roasted seasonal vegetables, avocado and a lemon tahini drizzle.",
        ingredients: [
          "1 cup cooked quinoa",
          "1 cup roasted vegetables (eggplant, bell pepper, zucchini)",
          "1/4 avocado, sliced",
          "1 tbsp tahini + lemon juice",
        ],
        instructions: [
          "Assemble quinoa and roasted veggies in a bowl, top with avocado.",
          "Mix tahini and lemon juice, drizzle over bowl.",
        ],
        nutrition: {
          calories: 560,
          protein_g: 18,
          carbs_g: 70,
          fat_g: 22,
          fiber_g: 10,
        },
        prepTimeMinutes: 12,
        cookTimeMinutes: 20,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "sat-di-01",
        mealType: "dinner",
        title: "Shrimp & Veggie Stir-Fry with Noodles",
        description:
          "Quick stir-fry of shrimp and crunchy vegetables tossed with udon or soba noodles and a light garlic sauce.",
        ingredients: [
          "120g shrimp, peeled",
          "1 cup mixed veggies (broccoli, bell pepper, carrot)",
          "75g cooked noodles",
          "1 tbsp soy sauce, 1 tsp garlic",
        ],
        instructions: [
          "Sauté garlic and vegetables, add shrimp until pink.",
          "Add cooked noodles and soy sauce, toss to combine and serve.",
        ],
        nutrition: {
          calories: 640,
          protein_g: 36,
          carbs_g: 75,
          fat_g: 14,
          fiber_g: 6,
        },
        prepTimeMinutes: 10,
        cookTimeMinutes: 10,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
  {
    day: "Sunday",
    meals: {
      breakfast: {
        id: "sun-bf-01",
        mealType: "breakfast",
        title: "Cottage Cheese with Fruit & Nuts",
        description:
          "High-protein cottage cheese paired with fresh fruit and a sprinkle of nuts for crunch.",
        ingredients: [
          "1 cup low-fat cottage cheese",
          "1/2 cup pineapple chunks or mixed fruit",
          "1 tbsp chopped walnuts or pecans",
          "1 tsp honey (optional)",
        ],
        instructions: [
          "Spoon cottage cheese into a bowl, top with fruit and nuts.",
          "Drizzle honey if desired.",
        ],
        nutrition: {
          calories: 350,
          protein_g: 28,
          carbs_g: 30,
          fat_g: 10,
          fiber_g: 2,
        },
        prepTimeMinutes: 3,
        servings: 1,
        imageUrl: BREAKFAST_IMG,
      },
      lunch: {
        id: "sun-lu-01",
        mealType: "lunch",
        title: "Grilled Vegetable & Hummus Sandwich",
        description:
          "Toasted wholegrain sandwich with grilled veggies, hummus and spinach for a light satisfying lunch.",
        ingredients: [
          "2 slices wholegrain bread, toasted",
          "1/2 cup grilled vegetables (zucchini, eggplant, pepper)",
          "2 tbsp hummus",
          "Handful spinach leaves",
        ],
        instructions: [
          "Spread hummus on bread, add grilled veggies and spinach, assemble sandwich.",
          "Slice in half and serve.",
        ],
        nutrition: {
          calories: 480,
          protein_g: 14,
          carbs_g: 60,
          fat_g: 16,
          fiber_g: 8,
        },
        prepTimeMinutes: 8,
        cookTimeMinutes: 8,
        servings: 1,
        imageUrl: LUNCH_IMG,
      },
      dinner: {
        id: "sun-di-01",
        mealType: "dinner",
        title: "Lean Beef & Vegetable Stew",
        description:
          "Slow-simmered lean beef stew with root vegetables and herbs. Comforting and nutrient-dense.",
        ingredients: [
          "150g lean beef, cubed",
          "1 carrot, diced",
          "1 potato, cubed",
          "1/2 onion, diced",
          "400ml beef or vegetable stock",
          "Bay leaf, thyme, salt & pepper",
        ],
        instructions: [
          "Brown beef cubes in a pot, remove and sauté onion.",
          "Return beef, add vegetables and stock, simmer 45–60 minutes until tender.",
          "Season and serve warm.",
        ],
        nutrition: {
          calories: 720,
          protein_g: 48,
          carbs_g: 60,
          fat_g: 26,
          fiber_g: 8,
        },
        prepTimeMinutes: 20,
        cookTimeMinutes: 60,
        servings: 1,
        imageUrl: DINNER_IMG,
      },
    },
  },
];

export default demoMealPlan;

/*
  Warnings:

  - Changed the type of `ingredients` on the `Recipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `instructions` on the `Recipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `nutritionData` on the `Recipe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "cookTimeMinutes" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "prepTimeMinutes" INTEGER,
ADD COLUMN     "servings" INTEGER,
DROP COLUMN "ingredients",
ADD COLUMN     "ingredients" JSONB NOT NULL,
DROP COLUMN "instructions",
ADD COLUMN     "instructions" JSONB NOT NULL,
DROP COLUMN "nutritionData",
ADD COLUMN     "nutritionData" JSONB NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ShoppingItem" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Migration: recipes_json_fields
-- Purpose: Safely migrate legacy string columns (ingredients, instructions, nutritionData)
-- to jsonb columns. This migration:
-- 1) Adds temporary nullable jsonb columns
-- 2) Provides helper functions that attempt to parse JSON (with exception handling)
-- 3) Backfills the jsonb columns using: JSON cast (if starts with [ or {), otherwise
--    attempts a comma-split fallback for array-like fields and '{}' for object fallbacks.
-- 4) Provides a preview SELECT to find rows that required fallbacks or failed parsing
-- 5) Provides commented RENAME/DROP steps to execute after manual verification
--
-- IMPORTANT:
-- - Take a DB backup before applying in production.
-- - Run the "preview" SELECT and inspect results before running the rename/drop section.
-- - Run this in a controlled environment (staging) first.
--
-- Usage:
-- 1) Run this migration SQL (it will add and populate the new columns).
-- 2) Inspect the preview SELECT for problematic rows.
-- 3) When satisfied, run the RENAME/DROP block (uncommented) inside a transaction.
-- 4) Run `npx prisma generate`, then tests and type-checks.

BEGIN;

-- OPTIONAL: create a quick backup table (uncomment if you want a full copy)
-- CREATE TABLE IF NOT EXISTS "Recipe_backup_before_recipes_json_fields" AS TABLE "Recipe";

-- 1) Add new nullable jsonb columns (temporary names)
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS ingredients_json jsonb;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS instructions_json jsonb;
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS nutritionData_json jsonb;

-- 2) Helper: try-cast text to jsonb safely (returns '{}' for invalid)
CREATE OR REPLACE FUNCTION safe_jsonb_from_text(in_text text) RETURNS jsonb AS $$
BEGIN
  IF in_text IS NULL OR trim(in_text) = '' THEN
    RETURN '{}'::jsonb;
  END IF;

  IF trim(in_text) ~ '^\s*[\{\[]' THEN
    BEGIN
      RETURN in_text::jsonb;
    EXCEPTION WHEN OTHERS THEN
      -- Malformed JSON — fall back to empty object
      RETURN '{}'::jsonb;
    END;
  END IF;

  -- Not JSON-looking input -> fallback
  RETURN '{}'::jsonb;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3) Helper: try-cast text to jsonb array safely (returns [] or array fallback)
CREATE OR REPLACE FUNCTION safe_jsonb_array_from_text(in_text text) RETURNS jsonb AS $$
DECLARE
  arr text[];
BEGIN
  IF in_text IS NULL OR trim(in_text) = '' THEN
    RETURN '[]'::jsonb;
  END IF;

  IF trim(in_text) ~ '^\s*\[' THEN
    BEGIN
      RETURN in_text::jsonb;
    EXCEPTION WHEN OTHERS THEN
      -- If array-like but malformed, fall back to comma-split
      NULL;
    END;
  END IF;

  -- Fallback: split on commas and return JSON array of strings (trim whitespace)
  arr := regexp_split_to_array(in_text, '\s*,\s*');
  RETURN to_jsonb(arr);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4) Backfill new columns using helpers
UPDATE "Recipe"
SET
  ingredients_json = safe_jsonb_array_from_text(ingredients),
  instructions_json = safe_jsonb_array_from_text(instructions),
  nutritionData_json = safe_jsonb_from_text(nutritionData)
WHERE (ingredients IS NOT NULL AND ingredients <> '')
   OR (instructions IS NOT NULL AND instructions <> '')
   OR (nutritionData IS NOT NULL AND nutritionData <> '');

-- 5) Preview rows that likely need manual inspection:
-- Criteria:
-- - Non-empty legacy string field but parsed result is an empty fallback
-- - This helps catch rows where parsing failed and we used default empty objects/arrays
--
-- Run this SELECT and review before renaming/dropping old columns.
SELECT id,
       ingredients,
       ingredients_json AS ingredients_parsed,
       instructions,
       instructions_json AS instructions_parsed,
       nutritionData,
       nutritionData_json AS nutrition_parsed
FROM "Recipe"
WHERE
  (
    ingredients IS NOT NULL AND trim(ingredients) <> ''
    AND (ingredients_json IS NULL OR jsonb_array_length(ingredients_json) = 0)
  )
  OR (
    instructions IS NOT NULL AND trim(instructions) <> ''
    AND (instructions_json IS NULL OR jsonb_array_length(instructions_json) = 0)
  )
  OR (
    nutritionData IS NOT NULL AND trim(nutritionData) <> ''
    AND nutritionData_json = '{}'::jsonb
  );

-- If the preview SELECT returns problematic rows, inspect them and fix them manually
-- (for example updating the original string to valid JSON or editing the parsed json).
-- When you're satisfied with the data consistency, run the RENAME/DROP block below.

-- 6) Rename/populate final columns (RUN AFTER VERIFICATION)
-- Uncomment and run inside a transaction once you have verified the parsed data.

-- START TRANSACTION;
-- -- Drop old string columns and move json columns into place
-- ALTER TABLE "Recipe" DROP COLUMN IF EXISTS ingredients;
-- ALTER TABLE "Recipe" RENAME COLUMN ingredients_json TO ingredients;
-- ALTER TABLE "Recipe" DROP COLUMN IF EXISTS instructions;
-- ALTER TABLE "Recipe" RENAME COLUMN instructions_json TO instructions;
-- ALTER TABLE "Recipe" DROP COLUMN IF EXISTS nutritionData;
-- ALTER TABLE "Recipe" RENAME COLUMN nutritionData_json TO nutritionData;
-- COMMIT;

-- 7) OPTIONAL: After migration and verification you may want to add constraints or set NOT NULL
-- For example:
-- ALTER TABLE "Recipe" ALTER COLUMN ingredients SET DEFAULT '[]'::jsonb;
-- ALTER TABLE "Recipe" ALTER COLUMN instructions SET DEFAULT '[]'::jsonb;
-- ALTER TABLE "Recipe" ALTER COLUMN nutritionData SET DEFAULT '{}'::jsonb;
-- Then, if desired, set NOT NULL after ensuring all rows comply.

-- Cleanup: if you created the backup table and are satisfied, you may drop it later.

COMMIT;

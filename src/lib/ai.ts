import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ZodSchema } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

/**
 * Call Gemini and attempt to return parsed JSON validated by a Zod schema.
 * Retries a few times, cleaning common wrappers (code fences) between attempts.
 */
export async function callGeminiJSON<T>(
  prompt: string,
  schema: ZodSchema<T>,
  attempts = 3,
): Promise<T> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  let lastErr: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // Append a short instruction to insist on raw JSON
      const retrySuffix =
        attempt === 1
          ? ""
          : "\nYour previous output failed validation. Re-output ONLY valid JSON that matches the schema. No markdown, no comments, no surrounding text.";

      const fullPrompt = `${prompt}\nRespond with raw JSON only.${retrySuffix}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        // Best-effort mime hint; Gemini may or may not respect it.
        // Cast via unknown->string to avoid using `any` while keeping the runtime hint.
        generationConfig: {
          responseMimeType: "application/json" as unknown as string,
        },
      });

      const response = await result.response;
      let text = response.text();

      // Clean common wrappers like ```json ... ``` or ``` ... ```
      text = text
        .replace(/```(?:json)?/gi, "")
        .replace(/```/g, "")
        .trim();

      // Try to find the first JSON array/object substring if extraneous text remains
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const candidate = match ? match[0] : text;

      const parsed = JSON.parse(candidate);
      // Validate with zod schema
      return schema.parse(parsed);
    } catch (err) {
      lastErr = err;
      // small delay between retries (backoff)
      await new Promise((res) => setTimeout(res, 400 * attempt));
      continue;
    }
  }

  throw new Error(
    `Failed to get valid JSON from Gemini after ${attempts} attempts: ${String(
      lastErr,
    )}`,
  );
}

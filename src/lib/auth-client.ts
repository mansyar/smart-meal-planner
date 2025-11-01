import { createAuthClient } from "better-auth/react";

/**
 * Create a baseURL acceptable to the auth client.
 * - In the browser, use the current origin so the URL is absolute (required by Better Auth).
 * - On the server, prefer BETTER_AUTH_URL env var; fall back to localhost for local dev.
 */
function getBaseURL() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  const envBase = process.env.BETTER_AUTH_URL;
  if (envBase) {
    return `${envBase.replace(/\/$/, "")}/api/auth`;
  }
  return "http://localhost:3000/api/auth";
}

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: getBaseURL(),
});

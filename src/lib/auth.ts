import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseUrl: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
  },
  // Configure social providers (Google OAuth)
  // Keep configuration minimal and rely on Better Auth's default callback
  // handler at /api/auth/callback/<provider>. Avoid custom redirectUri unless
  // you need special post-processing.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Optional: set explicit scopes or prompt behavior if needed:
      // scope: ["email", "profile"],
      // prompt: "select_account",
    },
  },
});

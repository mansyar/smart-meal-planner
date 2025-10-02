# =============================
# 1. Builder Stage
# =============================
FROM node:20-alpine AS builder

# Install required system libs
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy lockfile and package.json first (for better caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (frozen-lockfile ensures reproducibility)
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build Next.js app
RUN pnpm build

# =============================
# 2. Runner Stage
# =============================
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# Install pnpm (needed to run 'pnpm start')
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Fix permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Start the Next.js app
CMD ["pnpm", "start"]

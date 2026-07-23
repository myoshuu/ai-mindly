# ----------------------
# 1. Base setup
# ----------------------
FROM oven/bun:debian AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ----------------------
# 2. Dependencies
# ----------------------
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ----------------------
# 3. Builder
# ----------------------
FROM base AS builder
ARG DATABASE_URL
ARG ANTHROPIC_API_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun install --frozen-lockfile
RUN bunx prisma generate
RUN bun run build

# ----------------------
# 4. Runner
# ----------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ARG DATABASE_URL
ARG ANTHROPIC_API_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
# Next.js standalone does not copy static and public folders by default
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/lib/generated/prisma ./lib/generated/prisma

EXPOSE 3000
CMD ["bun", "server.js"]

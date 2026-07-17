# ----------------------
# 1. Base dependencies
# ----------------------
FROM oven/bun:1 AS base
WORKDIR /app

# Install common build dependencies in base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# ----------------------
# 2. Dev environment
# ----------------------
FROM base AS dev
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bunx prisma generate

EXPOSE 3000
CMD ["bun", "run", "dev"]

# ----------------------
# 3. Production deps
# ----------------------
FROM base AS deps
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ----------------------
# 4. Builder
# ----------------------
FROM base AS builder
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun install --frozen-lockfile
RUN bunx prisma generate

# Build Next.js
RUN bun run build

# ----------------------
# 5. Runner (standalone)
# ----------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Copy only what's needed from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["bun", "server.js"]

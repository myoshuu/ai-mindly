# ----------------------
# 1. Base setup
# ----------------------
FROM oven/bun:1-slim AS base
WORKDIR /app
# Install openssl (needed for Prisma)
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
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (crucial: output must generate before next build)
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
RUN bunx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
# A placeholder DB URL so static generation doesn't fail during build time
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN bun run build

# ----------------------
# 4. Runner
# ----------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.5"

# Copy Next.js standalone build outputs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy schema and migrations for db deployment
COPY --from=builder /app/prisma ./prisma

# Explicitly copy Prisma query engines so Next.js standalone can find them at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

# Start app using bun (or node server.js if preferred)
CMD ["bun", "server.js"]

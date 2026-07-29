FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM base AS builder
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY contracts/package.json ./contracts/
RUN pnpm install --frozen-lockfile
COPY . .
# prisma.config.ts reads DATABASE_URL; generate does not connect
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
RUN pnpm exec prisma generate
RUN pnpm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 4000
CMD ["node", "dist/src/main"]

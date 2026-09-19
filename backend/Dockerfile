# ────────────────────────────────
# STAGE 1: builder
# ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build

RUN npx tsc prisma.config.ts --module es2020 --esModuleInterop true --outDir dist --skipLibCheck true --ignoreConfig --types node
# ────────────────────────────────
# STAGE 2: runner
# ────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./dist/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist/prisma.config.js ./prisma.config.js

EXPOSE 5000

CMD ["node", "dist/server.js"]
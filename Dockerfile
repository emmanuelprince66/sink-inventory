# ----------------------------
# 1. Builder stage
# ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (all: prod + dev)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build Next.js
COPY . .
RUN npm run build

# ----------------------------
# 2. Runner stage (tiny final image)
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only the essentials
COPY package.json package-lock.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/next.config.js ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

EXPOSE 3000

CMD ["npm", "start"]

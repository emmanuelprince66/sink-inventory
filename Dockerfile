# ----------------------------
# 1. Builder stage
# ----------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies (only what's needed for building)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy project files and build Next.js
COPY . .
RUN yarn build

# ----------------------------
# 2. Runner stage (small final image)
# ----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose Next.js port
EXPOSE 3000

# Run Next.js
CMD ["yarn", "start"]

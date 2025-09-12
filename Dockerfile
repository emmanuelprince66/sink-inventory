# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps for building
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build NestJS (dist folder)
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only package.json files
COPY package*.json ./

# Install only production deps
RUN npm ci --only=production --legacy-peer-deps

# Copy build output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

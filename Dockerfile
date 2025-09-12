# ---------- BUILD STAGE ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install all deps (needed for build)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build NestJS
RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy only package.json files
COPY package*.json ./

# Install only production deps
RUN npm install --only=production --legacy-peer-deps

# Copy build output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

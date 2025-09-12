# ---------- BUILD STAGE ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install only prod deps first (for caching)
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && mv node_modules prod_node_modules

# Install all deps to build (includes devDeps)
RUN npm ci --legacy-peer-deps

# Copy rest of source
COPY . .

# Build NestJS project
RUN npm run build


# ---------- RUN STAGE ----------
FROM node:18-alpine

WORKDIR /app

# Copy production node_modules only
COPY --from=builder /app/prod_node_modules ./node_modules

# Copy build output + package files
COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]

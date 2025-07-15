# ---- Stage 1: Build ----
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Add the flag here
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# ---- Stage 2: Production ----
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
# And add the flag here
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
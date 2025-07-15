# ---- Stage 1: Build ----
# This stage installs dependencies, builds the Next.js app, and creates production artifacts.
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package manifests and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN npm run build

# ---- Stage 2: Production ----
# This stage takes only the build artifacts from the 'builder' stage for a lean final image.
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package manifests and install *only* production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built application from the 'builder' stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# The next.config.js file is often needed for the production server to run correctly
COPY --from=builder /app/next.config.js ./

# Expose the port the app runs on
EXPOSE 3000

# The command to run the production server
CMD ["npm", "start"]
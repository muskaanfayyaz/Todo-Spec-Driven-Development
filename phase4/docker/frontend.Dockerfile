# Dockerfile for the Phase III Frontend (Next.js)
# This Dockerfile creates a production-ready image for the frontend service.
# It uses a multi-stage build to create an optimized, lean image.

# --- Build Stage ---
# This stage installs dependencies, builds the Next.js application,
# and prepares the production artifacts.
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json from phase2 to install dependencies
# We assume phase3 uses the same dependencies and scripts as phase2.
COPY phase2/frontend/package.json ./package.json

# Install dependencies
# Using npm ci is recommended for reproducible builds if a package-lock.json is present
# Since we don't see one, we'll use npm install.
RUN npm install

# Copy the rest of the frontend code from both phase2 and phase3
# Phase3 code will overwrite phase2 code where there are conflicts.
COPY phase2/frontend/ /app/
COPY phase3/frontend/ /app/

# Build the Next.js application for production
RUN npm run build

# --- Production Stage ---
# This stage creates the final, lean production image.
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json


# Expose the port the app runs on
EXPOSE 3000

# The command to run the production server
CMD ["npm", "start"]

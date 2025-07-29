# --- Stage 1: Build Stage ---
# Use a specific Node.js version on a lightweight Alpine Linux base.
# Name this stage 'builder' so we can refer to it later.
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# If these files don't change, Docker won't re-run the `npm install` step.
COPY package*.json ./

# Install all dependencies, including development dependencies needed for the build.
RUN npm install

# Copy the rest of the application source code into the container.
COPY . .

# IMPORTANT: Generate the Prisma client based on your schema.
# This must happen *before* the TypeScript build.
RUN npx prisma generate

# Compile the TypeScript code into JavaScript. The output will be in the /dist folder.
RUN npm run build


# --- Stage 2: Production Stage ---
# Start from a fresh, clean Node.js image.
FROM node:18-alpine

WORKDIR /app

# Set the environment to 'production'. This is important for performance and security.
ENV NODE_ENV=production

# Copy only the necessary files from the 'builder' stage.
# This keeps the final image small and secure.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh .

# Make the entrypoint script executable.
RUN chmod +x ./entrypoint.sh

# SECURITY BEST PRACTICE: Create a non-root user to run the application.
# Running as 'root' inside a container is a security risk.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# The command that will be run when the container starts.
CMD ["./entrypoint.sh"]
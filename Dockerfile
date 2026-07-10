# ===== Stage 1: Build =====
FROM node:20 AS builder

WORKDIR /app

# Install dependencies including dev dependencies needed for build
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the frontend (Vite) and backend (esbuild -> dist/server.cjs)
RUN npm run build

# Ensure at least one .db file exists so the COPY wildcard in Stage 2 doesn't fail
RUN touch dummy.db

# ===== Stage 2: Production =====
FROM node:20-slim

WORKDIR /app

# We only need production dependencies in the final image
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built output from builder
COPY --from=builder /app/dist ./dist

# Copy the SQLite databases if they exist
COPY --from=builder /app/*.db* ./

# Optional: ensure metadata and .env.example are present if needed by system scripts
COPY --from=builder /app/metadata.json ./metadata.json
COPY --from=builder /app/.env.example ./.env.example

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Cloud Run / AI Studio standard exposed port
EXPOSE 3000

# Start compiled server
CMD ["node", "dist/server.cjs"]

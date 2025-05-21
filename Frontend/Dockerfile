# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Enable Corepack and prepare Yarn 4.5.2
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# Copy Yarn configuration, lock files, and local cache
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

# Install dependencies without --mount
RUN yarn install --immutable --immutable-cache

# Copy source code
COPY . .

# Build Next.js app
RUN yarn build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Enable Corepack and prepare Yarn 4.5.2
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder /app/.yarn ./.yarn

# Install only production dependencies
RUN yarn install --immutable --immutable-cache

# Expose port
EXPOSE 5173

# Start Next.js app
CMD ["yarn", "start"]

# SyncPilot EC2 server image.
# Default command runs the Express job-intake API. Run the BullMQ worker from
# this same image by overriding the command with: npm run worker
# Redis runs as a separate local container and is reached via REDIS_HOST.
FROM node:20-slim

WORKDIR /app

# Install dependencies first so this layer stays cached unless deps change.
# tsx is a devDependency but runs the TypeScript entrypoints directly at
# runtime, so dev dependencies must be installed in this image.
COPY package*.json ./
RUN npm install --include=dev

# Copy only the top-level TypeScript sources and tsconfig. signal-cli data and
# any local node_modules in the build context are intentionally excluded.
COPY *.ts tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3001

# Run as the unprivileged user that ships with the base image.
USER node

EXPOSE 3001

CMD ["npm", "run", "start"]

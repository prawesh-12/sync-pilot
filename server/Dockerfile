FROM node:22-slim

# Installed globally rather than via corepack: corepack fetches pnpm lazily into
# the calling user's cache, so a build as root leaves nothing for USER node and
# every container start re-downloads it from npm.
RUN npm install -g pnpm@11.7.0

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY *.ts tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3001

USER node

EXPOSE 3001

CMD ["pnpm", "start"]

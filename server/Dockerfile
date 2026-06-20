FROM node:22-slim

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./

RUN pnpm install --prod --frozen-lockfile

COPY *.ts tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3001

USER node

EXPOSE 3001

CMD ["pnpm", "start"]

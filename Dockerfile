FROM node:21.6.1-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app


FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run prisma:generate
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/node_modules/.pnpm/@prisma+client@5.10.2_prisma@5.10.2/node_modules/.prisma /app/node_modules/.pnpm/@prisma+client@5.10.2_prisma@5.10.2/node_modules/.prisma
COPY --from=build /app/dist /app/dist
EXPOSE 3333
CMD [ "pnpm", "start:prod" ]

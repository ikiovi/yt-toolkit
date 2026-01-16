# https://docs.deno.com/runtime/reference/docker/#use-multi-stage-builds
FROM denoland/deno:alpine-2.4.3 AS builder

WORKDIR /app
COPY . .

ENV DENO_DIR build/cache

RUN deno install --entrypoint src/index.ts

FROM denoland/deno:alpine-2.4.3

WORKDIR /app
COPY --from=builder /app .

ENV DENO_DIR build/cache
ENV YT_CACHE_PATH /tmp

ENTRYPOINT [ "deno", "task", "start" ]
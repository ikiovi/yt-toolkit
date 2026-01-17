# https://docs.deno.com/runtime/reference/docker/#use-multi-stage-builds
FROM denoland/deno:alpine-2.4.3 AS builder

WORKDIR /app
COPY deno.json deno.lock ./

ENV DENO_DIR=build/cache

RUN deno run install-deps

FROM denoland/deno:alpine-2.4.3

WORKDIR /app
COPY --from=builder /app .
COPY . .

ENV DENO_DIR=build/cache
ENV YT_CACHE_PATH=/tmp

ENTRYPOINT [ "deno", "task", "start" ]
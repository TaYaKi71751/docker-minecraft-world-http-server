#!/bin/bash

PODMAN_BIN="$(which podman)"
DOCKER_BIN="$(which docker)"
CONTAINER_RUNTIME=""

if [ -x "$PODMAN_BIN" ]; then
  echo "Using Podman to run the container."
  CONTAINER_RUNTIME="$PODMAN_BIN"
elif [ -x "$DOCKER_BIN" ]; then
  echo "Using Docker to run the container."
  CONTAINER_RUNTIME="$DOCKER_BIN"
else
  echo "Docker or Podman is required."
  exit 1
fi

mkdir -p world

${CONTAINER_RUNTIME} build --network host -t minecraft-world-downloader .
${CONTAINER_RUNTIME} rm -f minecraft-world-downloader || true
${CONTAINER_RUNTIME} run -d \
  --name minecraft-world-downloader \
  --network host \
  -e WORLD_DIR=/world \
  -v "$(pwd)/world:/world:ro" \
  minecraft-world-downloader

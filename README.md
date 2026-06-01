# Minecraft World Zip Downloader

A tiny Dockerized React + Node.js app laid out like `~/violet/violet-web`: a pnpm workspace with `packages/frontend` and `packages/backend`.

## Usage

#### docker-compose.yaml
```yaml
services:
  minecraft-world-downloader:
    build:
      context: .
      network: host
    network_mode: host
    environment:
      WORLD_DIR: /world
    volumes:
      - ./world:/world:ro
    restart: unless-stopped
```

Put your Minecraft world files in `./world`, then start the site:

```sh
mkdir -p world
docker compose up --build
```

Or use the helper script:

```sh
./run.sh
```

Open:

```text
http://localhost:3000
```

Click **Download world zip** to receive `minecraft-world-<unix-seconds>.zip`.

## Configuration

The Compose file mounts `./world` into the container at `/world`.

By default, each downloaded filename includes the current Unix timestamp. You can override it with:

```yaml
environment:
  DOWNLOAD_NAME: my-world.zip
```

## Notes

The backend uses `mktemp` to create a temporary zip path for each download request, runs `zip` inside the container, streams the file to the browser, then deletes the temporary file.

## Development

```sh
pnpm install
pnpm dev
```

The root workspace scripts mirror the `violet-web` style:

- `pnpm dev` starts backend and frontend together.
- `pnpm build` builds backend and frontend.
- `pnpm start` starts the built backend.

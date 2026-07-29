# Sweet Grass

A plant care app: photo-based inventory, species ID, and opinionated
watering/feeding reminders based on a soil moisture meter reading.

## Structure

```
apps/
  api/      Next.js API deployed to Vercel, Drizzle + Neon Postgres
  mobile/   Expo (React Native) app
```

## How it works (v1)

1. Take a photo of a plant -> `/api/identify` calls the Pl@ntNet API and
   returns candidate species for you to pick from. No image is stored.
2. On confirm, `/api/species/lookup` pulls default care info (watering
   method, feed frequency) from Perenual and caches it.
3. Type in your moisture meter reading for a plant -> the API compares it
   against that plant's moisture range and tells you what to do: water,
   soak, shower, or nothing. See `apps/api/lib/wateringLogic.ts`.

## Setup

### API (`apps/api`)

```bash
cd apps/api
cp .env.example .env
pnpm install
pnpm db:push   # push schema to your Neon database
pnpm dev
```

Env vars needed: `DATABASE_URL` (Neon), `API_SECRET` (any shared secret,
checked via `x-api-key` header), `PLANTNET_API_KEY` (free at
https://my.plantnet.org), `PERENUAL_API_KEY` (free at
https://perenual.com/docs/api).

Deploy `apps/api` to Vercel as its own project, root directory `apps/api`.

### Mobile (`apps/mobile`)

```bash
cd apps/mobile
cp .env.example .env
pnpm install
pnpm start
```

Set `EXPO_PUBLIC_API_URL` to your deployed (or local) API URL and
`EXPO_PUBLIC_API_KEY` to match `API_SECRET` above.

## Not in v1

- Multi-user auth (single shared API key, this is a personal app)
- Plant health status / sick tracking
- Adaptive per-plant learning from reading history
- Room light sensing

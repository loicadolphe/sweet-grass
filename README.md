# Sweet Grass

A plant care app: photo-based inventory, species ID, and opinionated
watering/feeding reminders based on a soil moisture meter reading.

## Structure

```
apps/
  api/      Next.js API deployed to Vercel, Drizzle + Neon Postgres
  mobile/   Expo (React Native) app -- builds for Android and for the web
```

One frontend, two targets. `apps/mobile` is the only UI codebase: Expo
compiles the same screens to a native Android app and, via react-native-web,
to a static web bundle for mobile browsers. There is no separate web
frontend to keep in sync.

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

Optional: `WEB_ORIGIN` restricts which browser origins may call the API
(comma-separate for several, e.g. your Vercel domain plus preview URLs).
Unset, any origin is allowed. This only affects the web build -- the native
app sends no `Origin` header and is unaffected either way. See
`apps/api/middleware.ts`.

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

### Web (same codebase as mobile)

```bash
cd apps/mobile
pnpm web          # dev server in a browser
pnpm build:web    # static export to apps/mobile/dist
```

Deploy to Vercel as a second project pointing at the same repo, root
directory `apps/mobile`. `vercel.json` there already sets the build command
(`pnpm expo export -p web`), the output directory (`dist`), and the SPA
rewrite. Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_API_KEY` in the Vercel
project, and add that deployment's origin to the API's `WEB_ORIGIN`.

Two caveats worth knowing:

- `EXPO_PUBLIC_*` values are inlined into the bundle at build time, so
  `EXPO_PUBLIC_API_KEY` is readable by anyone who opens the web app. That is
  the same shared secret the API trusts, so treat the web deployment as
  public and rotate `API_SECRET` if it leaks somewhere it shouldn't.
- Changing an `EXPO_PUBLIC_*` value does not invalidate Metro's transform
  cache. If a rebuild seems to ignore a new value, re-run with `--clear`.

## Not in v1

- Multi-user auth (single shared API key, this is a personal app)
- Plant health status / sick tracking
- Adaptive per-plant learning from reading history
- Room light sensing

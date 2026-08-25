# Sweet Grass Web

A web interface for the Sweet Grass plant care app, built with Next.js and deployable to Vercel.

## Setup

```bash
cd apps/web
cp .env.example .env
pnpm install
pnpm dev
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - The URL of your deployed API (e.g., `https://sweet-grass-api.vercel.app`)
- `NEXT_PUBLIC_API_KEY` - The API key matching the `API_SECRET` from your API deployment

## Development

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your changes to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import the repository
4. Set the root directory to `apps/web`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` - Your production API URL
   - `NEXT_PUBLIC_API_KEY` - Your production API key
6. Deploy

The app will be automatically deployed on every push to your main branch.

## Features

- 📷 Photo-based plant identification
- 📊 Moisture level logging with AI-powered advice
- 🌱 Plant inventory management
- 💧 Watering recommendations based on soil moisture

## Architecture

The web app communicates with the shared API backend (`apps/api`). Both the web and mobile apps use the same API, so updates to the backend benefit both platforms.

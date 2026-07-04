# Internal CRM Helpdesk

Generated Pipedrive Marketplace app using Express, TypeScript, and Drizzle ORM.

## Setup

```bash
cp .env.example .env
docker-compose up --watch
```

Fill in `PIPEDRIVE_CLIENT_ID`, `PIPEDRIVE_CLIENT_SECRET`, `PIPEDRIVE_REDIRECT_URI`, and `DATABASE_URL` in `.env`.

## Scripts

- `npm run dev` starts the backend server locally.
- `npm run typecheck` checks TypeScript.
- `npm run build` builds the generated project.
- `docker-compose up --watch` starts the backend and App Extensions Vite server in containers with Compose Watch.

## App Extensions

This project includes a React + Vite custom UI extension under `frontend/app-extension-ui`. It initializes `@pipedrive/app-extensions-sdk`, reads iframe query params, follows the user's light or dark theme, and exposes example SDK actions.

For local development, run `docker-compose up --watch`. It starts the backend and Vite dev server in containers, then syncs code changes into both services. Expose the Vite server through a public HTTPS tunnel and configure Developer Hub iframe URLs to use the tunnel:

- Custom modal: `https://<your-vite-tunnel>/extensions/modal`

For production, run `npm run build` and point Developer Hub to your backend-hosted URLs:

- Custom modal: `https://<your-backend-domain>/extensions/modal`

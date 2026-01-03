# Pastebin Lite

Minimal pastebin built with Next.js App Router.

## Features
- Create short pastes with optional TTL (seconds) and max views.
- Open created paste link in a new tab and show a copyable link.
- Dev-friendly file-backed fallback when Upstash env vars are not configured.

## Prerequisites
- Node.js 18+
- npm

## Install

```bash
npm install
```

## Environment
Set these to use Upstash Redis in production (recommended):

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

If those are not set, the app uses a server-only file-backed fallback stored in the OS temporary directory for local development.

## Run (development)

```bash
npm run dev
# open http://localhost:3000
```

## Build (production)

```bash
npm run build
npm run start
```

## Quick test
A small test script exists to POST then GET a paste locally:

```bash
node scripts/test_paste.js
```

Ensure the dev server is running before using the script.

## Important files
- `app/lib/kv.server.ts` — server-only KV provider (Upstash or file fallback).
- `app/lib/kv.ts` — client-safe stub (prevents bundling server-only modules).
- `app/api/paste/route.ts` — POST handler to create a paste.
- `app/api/paste/[id]/route.ts` and `app/api/pastes/[id]/route.ts` — GET handlers enforcing TTL and max views.
- `app/p/[id]/page.tsx` — server-rendered paste page (increments views on open).

## Pushing to GitHub

```bash
git add .
git commit -m "Add README and documentation"
git push origin main
```

If you want, I can create the commit and push for you.

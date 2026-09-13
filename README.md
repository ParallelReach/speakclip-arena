# speakclip-arena

**AI speaking gym → shareable 60s clips + duo invites**

Live: https://speakclip-arena.parallelreach.workers.dev

## Product loop

1. **Practice** `/app` — pick EN/AR prompt, record up to 60s (MediaRecorder), stop early OK
2. **Score + share** — heuristic fluency score; metadata in Cloudflare KV; card at `/c/[id]`
3. **Duo invite** — create short code; friend accepts at `/duo/[code]` on the same prompt
4. **Soft paywall** — 3 free practices/day (localStorage); Pro via Stripe Checkout

Audio stays client-side (optional `.webm` download). KV stores metadata JSON only.

## Setup

```bash
cp .env.example .env.local
# Fill STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test mode)
npm install
npm run dev
```

## Deploy (Cloudflare Workers + OpenNext)

```bash
npm run build:cf
npx wrangler deploy
```

KV binding: `CLIPS` → namespace `speakclip-clips`.

## Scripts

- `npm run dev` — local development
- `npm run build:cf` — OpenNext Cloudflare build
- `npm run deploy` — build + deploy

**Never commit real secrets.**

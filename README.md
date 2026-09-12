# speakclip-arena

**AI speaking gym → shareable 60s clips + duo invites**

## Setup

```bash
cp .env.example .env.local
# Fill STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (test mode)
npm install
npm run dev
```

Open http://localhost:3000 — Arabic locale at `/ar`.

## Stripe (test mode)

- Parallel Reach Stripe account: `acct_1UEqg3KILdv5fyda`
- Price ID (subscription, ~$10/week): `price_1UEqr7KILdv5fyda9pD26XtK`
- Checkout Session is created by `POST /api/checkout` (`mode=subscription`)
- Success → `/app` stub (“Wave 1 MVP — product loop next”)
- Cancel → landing with `?canceled=1`

**Never commit real secrets.** Use `.env.local` only; `.env.example` is the template.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build

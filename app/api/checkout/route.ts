import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secret || !priceId) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID" },
      { status: 500 }
    );
  }

  // Cloudflare Workers: use Fetch HTTP client (Node https hangs on workerd)
  const stripe = new Stripe(secret, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

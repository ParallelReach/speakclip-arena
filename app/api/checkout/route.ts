import { NextResponse } from "next/server";
import Stripe from "stripe";

const FALLBACK_BUY_URL =
  "https://parallelreach.lemonsqueezy.com/checkout/buy/2c65286c-5d80-4432-b2e2-6e60cf937621";

async function createLemonCheckout(): Promise<string | null> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) return null;

  const storeId = process.env.LEMONSQUEEZY_STORE_ID || "475492";
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID || "2130424";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://speakclip-arena.parallelreach.workers.dev";

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: `${appUrl}/app?checkout=success`,
            receipt_button_text: "Open SpeakClip Arena",
            receipt_link_url: `${appUrl}/app?checkout=success`,
          },
          checkout_data: {
            custom: {
              product: "speakclip-arena",
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: String(storeId),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: String(variantId),
            },
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Lemon Squeezy checkout failed (${res.status}): ${errText.slice(0, 400)}`
    );
  }

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = json?.data?.attributes?.url;
  if (!url) {
    throw new Error("Lemon Squeezy checkout response missing url");
  }
  return url;
}

async function createStripeCheckout(): Promise<string> {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secret || !priceId) {
    throw new Error("Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID");
  }

  // Cloudflare Workers: use Fetch HTTP client (Node https hangs on workerd)
  const stripe = new Stripe(secret, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: { product: "speakclip-arena" },
    success_url: `${appUrl}/app?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?canceled=1`,
  });

  if (!session.url) {
    throw new Error("Stripe session missing url");
  }
  return session.url;
}

export async function POST() {
  try {
    // Prefer Lemon Squeezy when API key is present
    if (process.env.LEMONSQUEEZY_API_KEY) {
      const url = await createLemonCheckout();
      if (url) {
        return NextResponse.json({ url });
      }
    }

    // Stripe only if LS key missing (fallback)
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID) {
      const url = await createStripeCheckout();
      return NextResponse.json({ url });
    }

    // Last resort: static LS buy link
    return NextResponse.json({ url: FALLBACK_BUY_URL });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout error";
    // If LS fails but we have a static buy URL, still offer it
    if (process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json(
        { url: FALLBACK_BUY_URL, warning: message },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

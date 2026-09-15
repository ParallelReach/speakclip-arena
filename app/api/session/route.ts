import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { ok: false, status: "invalid", customer: null },
      { status: 400 }
    );
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { ok: false, status: "misconfigured", customer: null },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";
    const customer =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

    return NextResponse.json({
      ok: paid,
      status: session.status ?? session.payment_status ?? "unknown",
      customer,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json(
      { ok: false, status: "error", customer: null, error: message },
      { status: 400 }
    );
  }
}

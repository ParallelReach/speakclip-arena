"use client";

import { useEffect, useState } from "react";
import { isPro, markPro, verifyAndUnlockPro } from "@/lib/paywall";

export default function ProUnlock({
  sessionId,
  checkoutSuccess,
  orderId,
  lang = "en",
}: {
  sessionId?: string;
  /** Lemon Squeezy redirect: ?checkout=success */
  checkoutSuccess?: boolean;
  /** Optional Lemon order id / hash if present on redirect */
  orderId?: string;
  lang?: "en" | "ar";
}) {
  const [state, setState] = useState<"idle" | "checking" | "ok" | "fail">(
    sessionId || checkoutSuccess ? "checking" : "idle"
  );

  useEffect(() => {
    // Lemon Squeezy success redirect — unlock client-side for now.
    // Live verification will use Lemon Squeezy webhooks later.
    if (checkoutSuccess) {
      markPro();
      setState("ok");
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        // Optionally accept Lemon order query params if present
        if (orderId) {
          // keep a soft marker for future webhook reconciliation
          try {
            localStorage.setItem("speakclip_ls_order", orderId);
          } catch {
            /* ignore */
          }
        }
        for (const key of [
          "order_id",
          "order",
          "lemon_order",
          "ls_order",
        ]) {
          url.searchParams.delete(key);
        }
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch {
        /* ignore */
      }
      return;
    }

    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      const result = await verifyAndUnlockPro(sessionId);
      if (cancelled) return;
      if (result.ok) {
        setState("ok");
        // Strip session_id from URL so refresh doesn't re-hit Stripe
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          window.history.replaceState({}, "", url.pathname + url.search);
        } catch {
          /* ignore */
        }
      } else {
        setState(isPro() ? "ok" : "fail");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, checkoutSuccess, orderId]);

  if (state === "checking") {
    return (
      <div className="banner-success" style={{ opacity: 0.85 }}>
        {lang === "ar" ? "نتحقق من الدفع…" : "Confirming your checkout…"}
      </div>
    );
  }

  if (state === "ok") {
    return (
      <div className="banner-success">
        {lang === "ar"
          ? "تم الاشتراك — مرحبًا في برو. تمرّن بلا حدود."
          : "Checkout success — welcome to Pro. Unlimited practice unlocked."}
      </div>
    );
  }

  if (state === "fail") {
    return (
      <div className="banner-fail">
        {lang === "ar"
          ? "لم نتمكن من تأكيد الدفع. إن دفعت، حدّث الصفحة أو تواصل معنا."
          : "We couldn’t confirm that checkout. If you paid, refresh or contact support."}
      </div>
    );
  }

  return null;
}

"use client";

import { useState } from "react";

export default function CheckoutButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        alert(data.error || "Checkout failed");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("Checkout failed");
      setLoading(false);
    }
  }

  const className = variant === "secondary" ? "btn-ghost" : "btn";

  return (
    <button className={className} onClick={startCheckout} disabled={loading}>
      {loading ? "…" : label}
    </button>
  );
}

"use client";

import { useState } from "react";

export default function CheckoutButton({ label }: { label: string }) {
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

  return (
    <button className="btn" onClick={startCheckout} disabled={loading}>
      {loading ? "…" : label}
    </button>
  );
}

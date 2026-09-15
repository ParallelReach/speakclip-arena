const FREE_LIMIT = 3;
const COUNT_KEY = "speakclip_practice_count";
const DAY_KEY = "speakclip_practice_day";
const PRO_KEY = "speakclip_pro";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPro(): void {
  try {
    localStorage.setItem(PRO_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Verify Stripe Checkout session then unlock Pro (Stripe fallback path). Lemon Squeezy uses ?checkout=success client unlock until webhooks land. */
export async function verifyAndUnlockPro(
  sessionId: string
): Promise<{ ok: boolean; status?: string }> {
  try {
    const res = await fetch(
      `/api/session?session_id=${encodeURIComponent(sessionId)}`
    );
    const data = (await res.json()) as {
      ok?: boolean;
      status?: string;
    };
    if (res.ok && data.ok) {
      markPro();
      return { ok: true, status: data.status };
    }
    return { ok: false, status: data.status || "unpaid" };
  } catch {
    return { ok: false, status: "error" };
  }
}

export function getPracticeCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const day = localStorage.getItem(DAY_KEY);
    if (day !== todayKey()) {
      localStorage.setItem(DAY_KEY, todayKey());
      localStorage.setItem(COUNT_KEY, "0");
      return 0;
    }
    return Number(localStorage.getItem(COUNT_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

export function canPractice(): boolean {
  if (isPro()) return true;
  return getPracticeCount() < FREE_LIMIT;
}

export function remainingFree(): number {
  if (isPro()) return Infinity;
  return Math.max(0, FREE_LIMIT - getPracticeCount());
}

/** Call when a practice attempt starts (or completes). Returns false if blocked. */
export function consumePractice(): boolean {
  if (isPro()) return true;
  const count = getPracticeCount();
  if (count >= FREE_LIMIT) return false;
  try {
    localStorage.setItem(DAY_KEY, todayKey());
    localStorage.setItem(COUNT_KEY, String(count + 1));
  } catch {
    /* ignore */
  }
  return true;
}

export { FREE_LIMIT, PRO_KEY };

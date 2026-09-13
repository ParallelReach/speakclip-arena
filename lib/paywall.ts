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
    if (localStorage.getItem(PRO_KEY) === "1") return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      localStorage.setItem(PRO_KEY, "1");
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function markPro(): void {
  try {
    localStorage.setItem(PRO_KEY, "1");
  } catch {
    /* ignore */
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

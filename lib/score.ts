export type ScoreInput = {
  durationMs: number;
  wordCount?: number;
  pauseEstimate?: number; // 0..1 fraction of silence-ish
};

export type ScoreResult = {
  score: number;
  breakdown: { duration: number; continuity: number; words: number };
};

/** Heuristic fluency score 0–100. No paid LLM. */
export function computeFluencyScore(input: ScoreInput): ScoreResult {
  const secs = Math.max(0, input.durationMs / 1000);
  // Ideal band ~20–55s for a 60s max clip
  let duration = 40;
  if (secs >= 8 && secs <= 55) {
    duration = Math.round(55 + Math.min(25, (Math.min(secs, 45) - 8) * 0.7));
  } else if (secs > 55) {
    duration = 78;
  } else if (secs >= 3) {
    duration = Math.round(25 + secs * 3);
  } else {
    duration = Math.round(secs * 8);
  }
  duration = clamp(duration, 0, 100);

  const pause = input.pauseEstimate ?? estimatePauseFromDuration(secs, input.wordCount);
  const continuity = clamp(Math.round(100 - pause * 85), 15, 100);

  const wpm = secs > 0 && input.wordCount != null ? (input.wordCount / secs) * 60 : null;
  let words = 55;
  if (wpm != null) {
    // Comfortable speaking ~110–160 wpm
    if (wpm >= 90 && wpm <= 170) words = 88;
    else if (wpm >= 60 && wpm < 90) words = 70;
    else if (wpm > 170 && wpm < 220) words = 72;
    else if (wpm >= 30) words = 50;
    else words = 35;
  } else if (secs >= 12) {
    words = 62; // no transcript — neutral
  } else {
    words = 48;
  }

  const score = clamp(
    Math.round(duration * 0.35 + continuity * 0.4 + words * 0.25),
    0,
    100
  );
  return { score, breakdown: { duration, continuity, words } };
}

function estimatePauseFromDuration(secs: number, wordCount?: number): number {
  if (wordCount != null && secs > 0) {
    const wpm = (wordCount / secs) * 60;
    if (wpm < 40) return 0.55;
    if (wpm < 70) return 0.35;
    if (wpm > 200) return 0.15;
    return 0.2;
  }
  // Without transcript, assume moderate continuity for longer takes
  if (secs < 5) return 0.45;
  if (secs < 15) return 0.32;
  return 0.22;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

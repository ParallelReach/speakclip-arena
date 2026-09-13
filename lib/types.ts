export type Prompt = {
  id: string;
  en: string;
  ar: string;
  theme: string;
};

export type ClipMeta = {
  id: string;
  promptId: string;
  promptText: string;
  lang: "en" | "ar";
  durationMs: number;
  score: number;
  scoreBreakdown: {
    duration: number;
    continuity: number;
    words: number;
  };
  wordCount?: number;
  transcriptPreview?: string;
  createdAt: string;
  duoCode?: string;
  role?: "host" | "guest";
};

export type DuoInvite = {
  code: string;
  promptId: string;
  promptText: string;
  lang: "en" | "ar";
  createdAt: string;
  hostClipId?: string;
  guestClipId?: string;
  hostScore?: number;
  guestScore?: number;
  status: "open" | "complete";
};

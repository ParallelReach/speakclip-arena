export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

type SpeechRecogLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecogEventLike) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecogEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecogCtor = new () => SpeechRecogLike;

export function startTranscript(
  lang: "en" | "ar",
  onPartial: (text: string) => void
): { stop: () => void; supported: boolean } {
  const w = typeof window !== "undefined" ? window : undefined;
  const SR = (w as unknown as { SpeechRecognition?: SpeechRecogCtor; webkitSpeechRecognition?: SpeechRecogCtor } | undefined)
    ?.SpeechRecognition ||
    (w as unknown as { webkitSpeechRecognition?: SpeechRecogCtor } | undefined)
      ?.webkitSpeechRecognition;

  if (!SR) {
    return { stop: () => {}, supported: false };
  }

  const recog = new SR();
  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = lang === "ar" ? "ar-SA" : "en-US";

  let finalText = "";
  recog.onresult = (ev) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i]!;
      if (r.isFinal) finalText += r[0]!.transcript + " ";
      else interim += r[0]!.transcript;
    }
    onPartial((finalText + interim).trim());
  };
  recog.onerror = () => {
    /* ignore — heuristic score still works */
  };

  try {
    recog.start();
  } catch {
    return { stop: () => {}, supported: false };
  }

  return {
    supported: true,
    stop: () => {
      try {
        recog.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

import type { Prompt } from "./types";

export const PROMPTS: Prompt[] = [
  {
    id: "elevator",
    theme: "elevator pitch",
    en: "Give a 30-second elevator pitch about yourself or your project.",
    ar: "قدّم عرضًا سريعًا عن نفسك أو مشروعك في ٣٠ ثانية.",
  },
  {
    id: "disagree",
    theme: "disagree politely",
    en: "Disagree politely with a friend who wants to skip an important deadline.",
    ar: "اعترض بلطف على صديق يريد تخطي موعد نهائي مهم.",
  },
  {
    id: "yesterday",
    theme: "story from yesterday",
    en: "Tell a short story about something that happened yesterday.",
    ar: "احكِ قصة قصيرة عن شيء حدث بالأمس.",
  },
  {
    id: "job10",
    theme: "explain job to a 10yo",
    en: "Explain your job to a curious 10-year-old.",
    ar: "اشرح وظيفتك لطفل فضولي في العاشرة.",
  },
  {
    id: "raise",
    theme: "ask for a raise",
    en: "Ask your manager for a raise — clear, confident, and brief.",
    ar: "اطلب زيادة من مديرك — بوضوح وثقة وبإيجاز.",
  },
  {
    id: "coldcall",
    theme: "cold-call opener",
    en: "Open a cold call: introduce yourself and earn 30 more seconds.",
    ar: "ابدأ مكالمة باردة: عرّف بنفسك واكسب ٣٠ ثانية إضافية.",
  },
  {
    id: "toast",
    theme: "toast a friend",
    en: "Toast a friend at dinner — warm, specific, under a minute.",
    ar: "ارفع نخب صديق على العشاء — دافئ ومحدد وفي أقل من دقيقة.",
  },
  {
    id: "movie",
    theme: "summarize a movie",
    en: "Summarize a movie you love without spoiling the ending.",
    ar: "لخّص فيلمًا تحبه دون كشف النهاية.",
  },
  {
    id: "teach",
    theme: "teach a skill",
    en: "Teach one small skill someone could try in the next five minutes.",
    ar: "علّم مهارة صغيرة يمكن لشخص تجربتها خلال خمس دقائق.",
  },
  {
    id: "complaint",
    theme: "handle a complaint",
    en: "Handle a customer complaint calmly and offer a fair next step.",
    ar: "تعامل مع شكوى عميل بهدوء وقدّم خطوة تالية عادلة.",
  },
  {
    id: "photo",
    theme: "describe a photo",
    en: "Describe an imaginary photo so vividly that someone could sketch it.",
    ar: "صف صورة متخيلة بوضوح يكفي ليرسمها شخص آخر.",
  },
  {
    id: "future",
    theme: "future goal",
    en: "Share one future goal and the first action you will take this week.",
    ar: "شارك هدفًا مستقبليًا والخطوة الأولى التي ستفعلها هذا الأسبوع.",
  },
];

export function getPrompt(id: string): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}

export function promptText(p: Prompt, lang: "en" | "ar"): string {
  return lang === "ar" ? p.ar : p.en;
}

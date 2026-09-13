import { NextResponse } from "next/server";
import { getPrompt, promptText } from "@/lib/prompts";
import { randomId } from "@/lib/ids";
import { computeFluencyScore } from "@/lib/score";
import { putClip } from "@/lib/kv";
import type { ClipMeta } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      promptId?: string;
      lang?: "en" | "ar";
      durationMs?: number;
      wordCount?: number;
      transcriptPreview?: string;
      pauseEstimate?: number;
      duoCode?: string;
      role?: "host" | "guest";
    };

    const promptId = body.promptId;
    const lang = body.lang === "ar" ? "ar" : "en";
    const durationMs = Number(body.durationMs ?? 0);

    if (!promptId || !Number.isFinite(durationMs) || durationMs < 500 || durationMs > 65_000) {
      return NextResponse.json({ error: "Invalid clip payload" }, { status: 400 });
    }

    const prompt = getPrompt(promptId);
    if (!prompt) {
      return NextResponse.json({ error: "Unknown prompt" }, { status: 400 });
    }

    const wordCount =
      typeof body.wordCount === "number" && body.wordCount >= 0
        ? Math.min(Math.floor(body.wordCount), 2000)
        : undefined;

    const { score, breakdown } = computeFluencyScore({
      durationMs,
      wordCount,
      pauseEstimate: body.pauseEstimate,
    });

    const clip: ClipMeta = {
      id: randomId(12),
      promptId: prompt.id,
      promptText: promptText(prompt, lang),
      lang,
      durationMs: Math.round(durationMs),
      score,
      scoreBreakdown: breakdown,
      wordCount,
      transcriptPreview: body.transcriptPreview?.slice(0, 280),
      createdAt: new Date().toISOString(),
      duoCode: body.duoCode?.slice(0, 16),
      role: body.role,
    };

    await putClip(clip);
    return NextResponse.json({ clip });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save clip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

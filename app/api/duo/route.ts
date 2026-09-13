import { NextResponse } from "next/server";
import { getPrompt, promptText } from "@/lib/prompts";
import { duoCode } from "@/lib/ids";
import { putDuo } from "@/lib/kv";
import type { DuoInvite } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      promptId?: string;
      lang?: "en" | "ar";
      hostClipId?: string;
      hostScore?: number;
    };

    const prompt = body.promptId ? getPrompt(body.promptId) : undefined;
    if (!prompt) {
      return NextResponse.json({ error: "Unknown prompt" }, { status: 400 });
    }

    const lang = body.lang === "ar" ? "ar" : "en";
    const code = duoCode();

    const duo: DuoInvite = {
      code,
      promptId: prompt.id,
      promptText: promptText(prompt, lang),
      lang,
      createdAt: new Date().toISOString(),
      hostClipId: body.hostClipId,
      hostScore: body.hostScore,
      status: "open",
    };

    await putDuo(duo);
    return NextResponse.json({ duo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create duo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

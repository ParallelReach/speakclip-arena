import { NextResponse } from "next/server";
import { getDuo, putDuo, getClip } from "@/lib/kv";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await ctx.params;
    if (!code || code.length > 16) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const body = (await req.json()) as {
      role?: "host" | "guest";
      clipId?: string;
      score?: number;
    };

    const duo = await getDuo(code.toLowerCase());
    if (!duo) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = body.role === "host" ? "host" : "guest";
    if (!body.clipId) {
      return NextResponse.json({ error: "clipId required" }, { status: 400 });
    }

    const clip = await getClip(body.clipId);
    if (!clip) {
      return NextResponse.json({ error: "Clip not found" }, { status: 400 });
    }

    if (role === "host") {
      duo.hostClipId = clip.id;
      duo.hostScore = clip.score;
    } else {
      duo.guestClipId = clip.id;
      duo.guestScore = clip.score;
    }

    if (duo.hostClipId && duo.guestClipId) {
      duo.status = "complete";
    }

    await putDuo(duo);
    return NextResponse.json({ duo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to complete duo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

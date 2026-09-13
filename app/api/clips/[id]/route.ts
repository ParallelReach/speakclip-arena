import { NextResponse } from "next/server";
import { getClip } from "@/lib/kv";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  if (!id || id.length > 32) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const clip = await getClip(id);
  if (!clip) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ clip });
}

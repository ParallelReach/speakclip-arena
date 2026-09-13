import { NextResponse } from "next/server";
import { getDuo } from "@/lib/kv";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params;
  if (!code || code.length > 16) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }
  const duo = await getDuo(code.toLowerCase());
  if (!duo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ duo });
}

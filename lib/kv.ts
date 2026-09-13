import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ClipMeta, DuoInvite } from "./types";

export async function getClipsKV(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const clips = (env as CloudflareEnv & { CLIPS?: KVNamespace }).CLIPS;
    return clips ?? null;
  } catch {
    return null;
  }
}

export async function putClip(clip: ClipMeta): Promise<void> {
  const kv = await getClipsKV();
  if (!kv) throw new Error("CLIPS KV not available");
  await kv.put(`clip:${clip.id}`, JSON.stringify(clip), {
    expirationTtl: 60 * 60 * 24 * 90, // 90 days
  });
}

export async function getClip(id: string): Promise<ClipMeta | null> {
  const kv = await getClipsKV();
  if (!kv) return null;
  const raw = await kv.get(`clip:${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as ClipMeta;
}

export async function putDuo(duo: DuoInvite): Promise<void> {
  const kv = await getClipsKV();
  if (!kv) throw new Error("CLIPS KV not available");
  await kv.put(`duo:${duo.code}`, JSON.stringify(duo), {
    expirationTtl: 60 * 60 * 24 * 30,
  });
}

export async function getDuo(code: string): Promise<DuoInvite | null> {
  const kv = await getClipsKV();
  if (!kv) return null;
  const raw = await kv.get(`duo:${code}`);
  if (!raw) return null;
  return JSON.parse(raw) as DuoInvite;
}

import { getClip } from "@/lib/kv";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const clip = await getClip(id);
  if (!clip) {
    return {
      title: "SpeakClip card",
      description: "Practice speaking and ship a 60s clip.",
    };
  }
  const title =
    clip.lang === "ar"
      ? `طلاقة ${clip.score} · SpeakClip`
      : `Fluency ${clip.score} · SpeakClip`;
  const description =
    clip.promptText.slice(0, 140) +
    (clip.promptText.length > 140 ? "…" : "");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ClipCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clip = await getClip(id);
  if (!clip) notFound();

  const dir = clip.lang === "ar" ? "rtl" : "ltr";
  const secs = (clip.durationMs / 1000).toFixed(1);
  const appHref =
    clip.lang === "ar"
      ? `/app?lang=ar&prompt=${encodeURIComponent(clip.promptId)}`
      : `/app?prompt=${encodeURIComponent(clip.promptId)}`;

  return (
    <main className="container" dir={dir}>
      <nav className="nav">
        <a className="brand" href="/">
          speakclip-arena
        </a>
        <a className="lang" href="/app">
          {clip.lang === "ar" ? "تمرّن الآن" : "Practice now"}
        </a>
      </nav>
      <section className="card result-card share-public">
        <div className="badge">
          {clip.lang === "ar" ? "بطاقة SpeakClip" : "SpeakClip card"}
        </div>
        <div className="score-ring">
          <span className="score-num">{clip.score}</span>
          <span className="score-label">
            {clip.lang === "ar" ? "طلاقة" : "fluency"}
          </span>
        </div>
        <p className="prompt-big">{clip.promptText}</p>
        <ul className="breakdown">
          <li>
            {clip.lang === "ar" ? "المدة" : "Duration"}: {secs}s ·{" "}
            {clip.scoreBreakdown.duration}
          </li>
          <li>
            {clip.lang === "ar" ? "الاستمرارية" : "Continuity"}:{" "}
            {clip.scoreBreakdown.continuity}
          </li>
          <li>
            {clip.lang === "ar" ? "الكلمات" : "Words"}:{" "}
            {clip.scoreBreakdown.words}
            {clip.wordCount != null ? ` · ${clip.wordCount}` : ""}
          </li>
        </ul>
        {clip.transcriptPreview && (
          <p className="transcript">{clip.transcriptPreview}</p>
        )}
        <div className="cta-row sticky-cta">
          <a className="btn" href={appHref}>
            {clip.lang === "ar" ? "جرّب هذا التمرين" : "Try this prompt"}
          </a>
        </div>
      </section>
      <p className="footer">
        {new Date(clip.createdAt).toLocaleString()} · /c/{clip.id}
      </p>
    </main>
  );
}

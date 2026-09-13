import { getDuo } from "@/lib/kv";
import { notFound } from "next/navigation";
import Arena from "@/components/Arena";

export default async function DuoPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const duo = await getDuo(code.toLowerCase());
  if (!duo) notFound();

  const lang = duo.lang;
  const complete = duo.status === "complete";

  return (
    <main className="container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <nav className="nav">
        <a className="brand" href="/">
          speakclip-arena
        </a>
        <a className="lang" href="/app">
          {lang === "ar" ? "الحلبة" : "Arena"}
        </a>
      </nav>
      <section className="hero tight">
        <div className="badge">
          {lang === "ar" ? "تحدي ثنائي" : "Duo challenge"} · {duo.code}
        </div>
        <h1>
          {lang === "ar" ? "نفس التمرين — نتيجتان" : "Same prompt — two scores"}
        </h1>
        <p className="lead prompt-big soft">{duo.promptText}</p>
      </section>

      {complete ? (
        <section className="card duo-compare">
          <h2>{lang === "ar" ? "المقارنة" : "Comparison"}</h2>
          <div className="compare-grid">
            <div>
              <div className="muted">{lang === "ar" ? "المضيف" : "Host"}</div>
              <div className="score-num sm">{duo.hostScore ?? "—"}</div>
              {duo.hostClipId && (
                <a className="link" href={`/c/${duo.hostClipId}`}>
                  /c/{duo.hostClipId}
                </a>
              )}
            </div>
            <div>
              <div className="muted">{lang === "ar" ? "الضيف" : "Guest"}</div>
              <div className="score-num sm">{duo.guestScore ?? "—"}</div>
              {duo.guestClipId && (
                <a className="link" href={`/c/${duo.guestClipId}`}>
                  /c/{duo.guestClipId}
                </a>
              )}
            </div>
          </div>
          <div className="cta-row" style={{ marginTop: "1rem" }}>
            <a className="btn" href="/app">
              {lang === "ar" ? "ابدأ تمرينك" : "Start your own"}
            </a>
          </div>
        </section>
      ) : (
        <Arena
          initialLang={lang}
          lockedPromptId={duo.promptId}
          duoCode={duo.code}
          duoRole={duo.hostClipId ? "guest" : "host"}
        />
      )}
      <p className="footer">Duo · /duo/{duo.code}</p>
    </main>
  );
}

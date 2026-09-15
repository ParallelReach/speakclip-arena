import { getDuo } from "@/lib/kv";
import { notFound } from "next/navigation";
import Arena from "@/components/Arena";
import CheckoutButton from "@/app/CheckoutButton";

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
  const waitingForGuest = !complete && !!duo.hostClipId;

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
          {complete
            ? lang === "ar"
              ? "انتهى التحدي — قارن النتيجة"
              : "Challenge complete — compare scores"
            : waitingForGuest
              ? lang === "ar"
                ? "دورك الآن"
                : "Your turn"
              : lang === "ar"
                ? "نفس التمرين — نتيجتان"
                : "Same prompt — two scores"}
        </h1>
        <p className="lead prompt-big soft">{duo.promptText}</p>
        {!complete && (
          <p className="trust-line">
            {waitingForGuest
              ? lang === "ar"
                ? "سجّل حتى ٦٠ ثانية على نفس التمرين"
                : "Record up to 60s on the same prompt"
              : lang === "ar"
                ? "ابدأ التسجيل — ثم أرسل الرابط لصديقك"
                : "Start recording — then send the link to a friend"}
          </p>
        )}
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
          <div className="cta-row wrap sticky-cta" style={{ marginTop: "1.25rem" }}>
            <a className="btn" href="/app">
              {lang === "ar" ? "ادعُ آخر" : "Invite another"}
            </a>
            <CheckoutButton
              label={lang === "ar" ? "برو ١٠$/أسبوع" : "Go Pro $10/week"}
              variant="secondary"
            />
          </div>
          <p className="trust-line">
            {lang === "ar" ? "إلغاء في أي وقت · دفع آمن" : "Cancel anytime · Secure checkout"}
          </p>
        </section>
      ) : (
        <>
          {waitingForGuest && (
            <div className="banner-success your-turn">
              {lang === "ar"
                ? "دورك — سجّل الآن وأغلق التحدي"
                : "Your turn — record now to finish the challenge"}
            </div>
          )}
          <Arena
            initialLang={lang}
            lockedPromptId={duo.promptId}
            duoCode={duo.code}
            duoRole={duo.hostClipId ? "guest" : "host"}
          />
        </>
      )}
      <p className="footer">Duo · /duo/{duo.code}</p>
    </main>
  );
}

import Arena from "@/components/Arena";
import ProUnlock from "@/app/ProUnlock";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{
    lang?: string;
    session_id?: string;
    checkout?: string;
    order_id?: string;
    order?: string;
    prompt?: string;
  }>;
}) {
  const sp = await searchParams;
  const lang = sp.lang === "ar" ? "ar" : "en";
  const sessionId = sp.session_id || undefined;
  const checkoutSuccess = sp.checkout === "success";
  const orderId = sp.order_id || sp.order || undefined;
  const promptId = sp.prompt || undefined;

  return (
    <main className="container">
      <nav className="nav">
        <a className="brand" href="/">
          speakclip-arena
        </a>
        <div className="nav-links">
          <a className="lang" href={lang === "ar" ? "/app" : "/app?lang=ar"}>
            {lang === "ar" ? "English" : "العربية"}
          </a>
          <a className="lang" href={lang === "ar" ? "/ar" : "/"}>
            {lang === "ar" ? "الرئيسية" : "Home"}
          </a>
        </div>
      </nav>
      <ProUnlock
        sessionId={sessionId}
        checkoutSuccess={checkoutSuccess}
        orderId={orderId}
        lang={lang}
      />
      <section className="hero tight">
        <div className="badge">
          {lang === "ar" ? "الحلبة" : "Arena"}
        </div>
        <h1>
          {lang === "ar"
            ? "تمرّن · سجّل · شارك"
            : "Practice · record · share"}
        </h1>
        <p className="lead">
          {lang === "ar"
            ? "موجهات بالإنجليزية والعربية، تسجيل حتى ٦٠ ثانية، درجة طلاقة، ودعوة ثنائية."
            : "EN + AR prompts, up to 60s voice, fluency score, and duo invites."}
        </p>
      </section>
      <Arena initialLang={lang} initialPromptId={promptId} />
      <p className="footer">Parallel Reach · SpeakClip Arena</p>
    </main>
  );
}

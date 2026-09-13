import Arena from "@/components/Arena";

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; session_id?: string }>;
}) {
  const sp = await searchParams;
  const lang = sp.lang === "ar" ? "ar" : "en";
  const justPaid = Boolean(sp.session_id);

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
      {justPaid && (
        <div className="banner-success">
          {lang === "ar"
            ? "تم الاشتراك — مرحبًا في برو. تمرّن بلا حدود."
            : "Checkout success — welcome to Pro. Unlimited practice unlocked."}
        </div>
      )}
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
      <Arena initialLang={lang} />
      <p className="footer">Parallel Reach · SpeakClip Arena</p>
    </main>
  );
}

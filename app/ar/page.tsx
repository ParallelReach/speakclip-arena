import CheckoutButton from "../CheckoutButton";

export default function HomeAr() {
  return (
    <main className="container" dir="rtl" lang="ar">
      <nav className="nav">
        <div className="brand">speakclip-arena</div>
        <div className="nav-links">
          <a className="lang" href="/app?lang=ar">
            افتح الحلبة
          </a>
          <a className="lang" href="/">
            English
          </a>
        </div>
      </nav>
      <section className="hero">
        <div className="badge">الموجة ١ — مباشر</div>
        <h1>تحدث أفضل. انشر مقاطع ٦٠ ثانية. ادعُ صديقًا.</h1>
        <p className="lead">
          تمارين تحدث موقوتة مع درجات طلاقة — ثم شارك بطاقة أو تحدَّ صديقًا.
          ثلاث محاولات مجانية يوميًا؛ برو بلا حدود.
        </p>
        <div className="cta-row sticky-cta">
          <a className="btn" href="/app?lang=ar">
            تمرّن مجانًا
          </a>
          <CheckoutButton label="برو ١٠$ / أسبوع" variant="secondary" />
        </div>
        <p className="trust-line">إلغاء في أي وقت · دفع آمن</p>
      </section>
      <section className="card">
        <h2>ماذا تحصل عليه</h2>
        <ul>
          <li>تمارين تحدث موقوتة (عربي + إنجليزي) مع درجات طلاقة</li>
          <li>تصدير مقاطع ٦٠ ثانية وبطاقات مشاركة</li>
          <li>دعوات ثنائية لجلسات المساءلة</li>
        </ul>
      </section>
      <p className="footer">Parallel Reach · SpeakClip Arena</p>
    </main>
  );
}

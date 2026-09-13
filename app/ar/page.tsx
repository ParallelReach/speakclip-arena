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
        <h1>SpeakClip Arena — درّب تحدثك وانشر المقاطع</h1>
        <p className="lead">
          صالة تحدث → مقاطع ٦٠ ثانية قابلة للمشاركة + دعوات ثنائية. ثلاث
          محاولات مجانية يوميًا — ثم برو.
        </p>
        <div className="cta-row">
          <a className="btn" href="/app?lang=ar">
            تمرّن مجانًا
          </a>
          <CheckoutButton label="افتح برو — ١٠$ / أسبوع" />
          <span className="price">إلغاء في أي وقت · وضع اختبار Stripe</span>
        </div>
      </section>
      <section className="card">
        <h2>ماذا تحصل عليه</h2>
        <ul>
          <li>تمارين تحدث موقوتة (عربي + إنجليزي) مع درجات طلاقة</li>
          <li>تصدير مقاطع ٦٠ ثانية وبطاقات مشاركة</li>
          <li>دعوات ثنائية لجلسات المساءلة</li>
        </ul>
      </section>
      <p className="footer">Parallel Reach · Stripe test · acct_1UEqg3KILdv5fyda</p>
    </main>
  );
}

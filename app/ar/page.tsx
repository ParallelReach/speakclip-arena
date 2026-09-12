import CheckoutButton from "../CheckoutButton";

export default function HomeAr() {
  return (
    <main className="container" dir="rtl" lang="ar">
      <nav className="nav">
        <div className="brand">speakclip-arena</div>
        <a className="lang" href="/">English</a>
      </nav>
      <section className="hero">
        <div className="badge">الموجة ١ — MVP</div>
        <h1>SpeakClip Arena — درّب تحدثك وانشر المقاطع</h1>
        <p className="lead">صالة تحدث بالذكاء الاصطناعي → مقاطع ٦٠ ثانية قابلة للمشاركة + دعوات ثنائية</p>
        <div className="cta-row">
          <CheckoutButton label="ابدأ — ١٠$ / أسبوع" />
          <span className="price">إلغاء في أي وقت · وضع اختبار Stripe</span>
        </div>
      </section>
      <section className="card">
        <h2>ماذا تحصل عليه</h2>
        <ul>
          <li>تمارين تحدث موقوتة مع ملاحظات بالذكاء الاصطناعي</li>
          <li>تصدير مقاطع ٦٠ ثانية قابلة للمشاركة</li>
          <li>دعوات ثنائية لجلسات المساءلة</li>
        </ul>
      </section>
      <p className="footer">Parallel Reach · Stripe test · acct_1UEqg3KILdv5fyda</p>
    </main>
  );
}

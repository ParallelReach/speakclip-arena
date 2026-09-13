import CheckoutButton from "./CheckoutButton";

export default function Home() {
  return (
    <main className="container">
      <nav className="nav">
        <div className="brand">speakclip-arena</div>
        <div className="nav-links">
          <a className="lang" href="/app">
            Open arena
          </a>
          <a className="lang" href="/ar">
            العربية
          </a>
        </div>
      </nav>
      <section className="hero">
        <div className="badge">Wave 1 · live</div>
        <h1>SpeakClip Arena — train speaking, ship clips</h1>
        <p className="lead">
          AI speaking gym → shareable 60s clips + duo invites. Three free
          practices a day — then go Pro.
        </p>
        <div className="cta-row">
          <a className="btn" href="/app">
            Practice free
          </a>
          <CheckoutButton label="Go Pro — $10/week" />
          <span className="price">Cancel anytime · Stripe test mode</span>
        </div>
      </section>
      <section className="card">
        <h2>What you get</h2>
        <ul>
          <li>Timed speaking drills (EN + AR) with fluency scores</li>
          <li>Export shareable 60-second clips and cards</li>
          <li>Duo invites for accountability sessions</li>
        </ul>
      </section>
      <p className="footer">Parallel Reach · Stripe test · acct_1UEqg3KILdv5fyda</p>
    </main>
  );
}

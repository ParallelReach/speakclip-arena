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
        <h1>Speak better. Ship 60s clips. Invite a duo.</h1>
        <p className="lead">
          Timed speaking drills with fluency scores — then share a card or
          challenge a friend. Three free practices a day; Pro unlocks unlimited.
        </p>
        <div className="cta-row sticky-cta">
          <a className="btn" href="/app">
            Practice free
          </a>
          <CheckoutButton label="Go Pro $10/week" variant="secondary" />
        </div>
        <p className="trust-line">Cancel anytime · Secure checkout</p>
      </section>
      <section className="card">
        <h2>What you get</h2>
        <ul>
          <li>Timed speaking drills (EN + AR) with fluency scores</li>
          <li>Export shareable 60-second clips and cards</li>
          <li>Duo invites for accountability sessions</li>
        </ul>
      </section>
      <p className="footer">Parallel Reach · SpeakClip Arena</p>
    </main>
  );
}

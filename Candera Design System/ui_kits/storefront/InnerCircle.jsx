/* Candera — Inner Circle page. Two-panel editorial: feature aside + entry panel. */
const INNER_BENEFITS = [
  { t: "First Pour", d: "First right to numbered vessels before a batch opens to the public." },
  { t: "Batch Announcements", d: "Word from the studio the moment a new micro-batch enters curing." },
  { t: "Collector Releases", d: "Access to limited pours and archive vessels held back from the shop." },
  { t: "Studio Correspondence", d: "Occasional ritual notes — never a newsletter, never a sale." },
];

function InnerCircle() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const submit = (e) => { e.preventDefault(); setStatus("loading"); setTimeout(() => setStatus("success"), 750); };

  return (
    <main className="c-inner">
      <div className="c-inner__split">
        {/* Feature panel */}
        <aside className="c-inner__feature">
          <div className="c-inner__feature-bg"><img src="../../assets/images/crimson-noir.jpg" alt="" aria-hidden="true" /></div>
          <div className="c-inner__feature-content">
            <span className="c-inner__kick">By Invitation</span>
            <h1 className="c-inner__title">The Inner Circle</h1>
            <p className="c-inner__quote">"A correspondence between the studio and those who collect with intention."</p>
            <ul className="c-inner__benefits">
              {INNER_BENEFITS.map((b) => (
                <li key={b.t}>
                  <span className="c-inner__bnum">—</span>
                  <span><strong>{b.t}</strong>{b.d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="c-inner__feature-grain" />
        </aside>

        {/* Entry panel */}
        <div className="c-inner__panel">
          {status === "success" ? (
            <div className="c-inner__done">
              <span className="c-inner__seal">✦</span>
              <p className="c-inner__done-h">Request received.</p>
              <p className="c-inner__done-s">We'll be in touch before the next batch drops. Watch for a note from the studio.</p>
            </div>
          ) : (
            <React.Fragment>
              <span className="c-inner__panel-kick">Limited Access</span>
              <h2 className="c-inner__panel-title">Request entry to the studio list.</h2>
              <div className="c-inner__intro">
                <p>Each Candera batch is numbered and finite — often sold within days of release. Membership is the only way to reach a vessel before it's gone.</p>
                <p>Tell us where to find you. Entry is reviewed by hand.</p>
              </div>
              <form className="c-inner__form" onSubmit={submit}>
                <div className="c-field">
                  <label>Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
                </div>
                <div className="c-field">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" />
                </div>
                <Button type="submit" variant="primary" size="block" disabled={status === "loading"}>
                  {status === "loading" ? "Requesting\u2026" : "Request Entry"}
                </Button>
                <p className="c-inner__fineprint">No spam. No sales. You may leave the circle at any time.</p>
              </form>
            </React.Fragment>
          )}
        </div>
      </div>
    </main>
  );
}
Object.assign(window, { InnerCircle });

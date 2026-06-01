/* Candera — sticky navigation. Transparent over hero, solid on scroll. */
function Nav({ route, navigate, openQuiz, cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const onHome = route.name === "home";
  const transparent = onHome && !scrolled;

  useEffect(() => {
    const scroller = document.querySelector(".c-app");
    const onScroll = () => setScrolled((scroller?.scrollTop || 0) > 120);
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller?.removeEventListener("scroll", onScroll);
  }, []);

  const go = (r) => (e) => { e.preventDefault(); navigate(r); setMobileOpen(false); };

  return (
    <header className={`c-nav ${transparent ? "is-transparent" : "is-solid"}`}>
      <div className="c-nav__inner">
        <nav className="c-nav__links c-nav__links--left">
          <a href="#" onClick={go({ name: "collection" })} className={route.name === "collection" ? "is-active" : ""}>Collection</a>
          <a href="#" onClick={go({ name: "about" })} className={route.name === "about" ? "is-active" : ""}>The Craft</a>
          <button className="c-nav__quiz" onClick={openQuiz}><IconSparkles size={12} />Scent Quiz</button>
        </nav>
        <button className="c-nav__burger" onClick={() => setMobileOpen(true)} aria-label="Menu"><IconMenu size={20} /></button>
        <a href="#" onClick={go({ name: "home" })} className="c-nav__logo">CANDERA</a>
        <div className="c-nav__links--right">
          <a href="#" onClick={go({ name: "collection" })} className={`c-nav__shop ${transparent ? "is-hidden" : ""}`}>Shop the Batch</a>
          <button className="c-nav__bag" onClick={() => navigate({ name: "collection" })} aria-label="Cart">
            <IconBag size={20} />
            {cartCount > 0 && <span className="c-nav__count">{cartCount}</span>}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="c-nav__sheet">
          <div className="c-nav__sheet-top">
            <span className="c-nav__logo">CANDERA</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close"><IconX size={24} /></button>
          </div>
          <nav className="c-nav__sheet-links">
            <a href="#" onClick={go({ name: "collection" })}>The Batch</a>
            <a href="#" onClick={go({ name: "about" })}>The Craft</a>
            <button onClick={() => { openQuiz(); setMobileOpen(false); }}>Scent Quiz</button>
            <a href="#" onClick={go({ name: "inner" })}>Inner Circle</a>
          </nav>
        </div>
      )}
    </header>
  );
}
Object.assign(window, { Nav });

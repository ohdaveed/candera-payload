/* Candera — page compositions: Home, Collection, About */
function Home({ navigate, openQuiz, onOpen, onAdd }) {
  const { home, products } = window.CANDERA;
  return (
    <main>
      <Hero navigate={navigate} openQuiz={openQuiz} />
      <section className="c-section c-section--white" id="collection">
        <div className="c-collhead">
          <div>
            <Eyebrow>{home.collectionTag}</Eyebrow>
            <h2 className="c-collhead__title">{home.collectionHeadline}</h2>
          </div>
          <p className="c-collhead__desc">{home.collectionDescription}</p>
        </div>
        <ProductGrid products={products.slice(0, 6)} onOpen={onOpen} onAdd={onAdd} />
      </section>
      <Testimonials />
      <InnerCircleBand navigate={navigate} />
    </main>
  );
}

const TAG_DOT = { "Limited Batch": "is-ember", "Bestseller": "is-obsidian", "New Release": "is-rose" };
function Collection({ onOpen, onAdd }) {
  const { products } = window.CANDERA;
  const [tag, setTag] = useState("all");
  const tags = ["all", ...new Set(products.map((p) => p.tag))];
  const list = tag === "all" ? products : products.filter((p) => p.tag === tag);

  return (
    <main className="c-coll">
      <div className="c-coll__head">
        <p className="c-coll__kick">The Studio</p>
        <h1 className="c-coll__title">Current Collection</h1>
      </div>
      <div className="c-coll__filter">
        <div className="c-coll__tags">
          {tags.map((t) => (
            <button key={t} className={`c-coll__tagbtn ${tag === t ? "is-active" : ""}`} onClick={() => setTag(t)}>
              {t === "all" ? "All Vessels" : t}
            </button>
          ))}
        </div>
        <span className="c-coll__count">{list.length} {list.length === 1 ? "vessel" : "vessels"}</span>
      </div>
      <ProductGrid products={list} onOpen={onOpen} onAdd={onAdd} />
    </main>
  );
}

const STEPS = [
  { step: "01", title: "Botanical Sourcing", description: "We partner with sustainable apiaries and soy farms to ensure our base is 100% biodegradable and phthalate-free." },
  { step: "02", title: "Precision Infusion", description: "Our oils are blended at precisely 185°F so the fragrance molecules bond perfectly with the wax matrix." },
  { step: "03", title: "The Hand Pour", description: "Every vessel is pre-heated and hand-poured in micro-batches to prevent air pockets and ensure a level surface." },
  { step: "04", title: "Curing Silence", description: "Finished candles cure in a dark room for two full weeks, letting the scent reach its peak complexity." },
];
const FAQ = [
  { q: "How do I maximize my candle's lifespan?", a: "Always trim the wick to 1/4 inch before lighting. On your first burn, allow the wax to melt across the entire surface to prevent 'tunneling.'" },
  { q: "Are the vessels reusable?", a: "Yes. Once 1/2 inch of wax remains, pour boiling water in to lift the remaining wax. The stoneware is food-safe and perfect for plants or storage." },
  { q: "Why are batches limited?", a: "Quality control is paramount. By pouring in small micro-batches, we ensure the fragrance oil is perfectly distributed and the wicks are centered manually." },
];
function About() {
  return (
    <main className="c-about">
      <section className="c-section c-section--white">
        <div className="c-about__hero">
          <div className="c-about__hero-text">
            <Eyebrow>The Methodology</Eyebrow>
            <h1 className="c-about__h1">16 Hours of Intention.</h1>
            <p className="c-about__lead">In a world that demands speed, we choose a sensory revolution. Our pure products are cultivated through slow, deliberate rituals that ensure the highest fragrance throw and the cleanest burn.</p>
          </div>
          <div className="c-about__hero-img"><img src="../../assets/images/minimalist-airy-about.png" alt="The Candera studio" /></div>
        </div>
      </section>
      <section className="c-section c-section--muted">
        <div className="c-about__steps">
          {STEPS.map((s) => (
            <Reveal key={s.step} className="c-about__step">
              <span className="c-about__stepnum">{s.step}</span>
              <h3 className="c-about__steptitle">{s.title}</h3>
              <p className="c-about__stepdesc">{s.description}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="c-section c-section--dark">
        <div className="c-about__faqhead">
          <h3 className="c-about__faqtitle">Care &amp; Logistics</h3>
          <p className="c-about__faqsub">Common inquiries for the intentional collector.</p>
        </div>
        <div className="c-about__faq">
          {FAQ.map((f, i) => (
            <div key={i} className="c-about__faqitem">
              <h4>{f.q}<span>+</span></h4>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
Object.assign(window, { Home, Collection, About });

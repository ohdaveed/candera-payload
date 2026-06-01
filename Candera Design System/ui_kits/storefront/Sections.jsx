/* Candera — testimonials + Inner Circle CTA band (home page sections) */
function Testimonials() {
  const { home } = window.CANDERA;
  return (
    <section className="c-testi">
      <Eyebrow>{home.testimonialsTag}</Eyebrow>
      <div className="c-testi__grid">
        {home.testimonials.map((t, i) => (
          <Reveal key={i} delay={i * 120} className="c-testi__item">
            <div className="c-testi__stars">{[...Array(5)].map((_, j) => <IconStar key={j} size={14} />)}</div>
            <p className="c-testi__quote">"{t.quote}"</p>
            <div className="c-testi__who">
              <p className="c-testi__author">— {t.author}, {t.location}</p>
              <span className="c-testi__badge"><IconCheck size={10} />{t.badge}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function InnerCircleBand({ navigate }) {
  const { home } = window.CANDERA;
  return (
    <section className="c-iband">
      <div className="c-iband__art"><img src="../../assets/images/crimson-noir.jpg" alt="" aria-hidden="true" /></div>
      <div className="c-iband__content">
        <IconMail size={38} className="c-iband__icon" />
        <h2 className="c-iband__title">{home.innerCircleHeadline}</h2>
        <p className="c-iband__desc">{home.innerCircleDescription}</p>
        <Button variant="ember" onClick={() => navigate({ name: "inner" })}>Request Entry</Button>
      </div>
    </section>
  );
}
Object.assign(window, { Testimonials, InnerCircleBand });

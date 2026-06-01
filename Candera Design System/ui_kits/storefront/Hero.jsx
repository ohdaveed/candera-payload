/* Candera — editorial hero. Full-bleed botanical photo, dimmed, Fraunces italic headline. */
function Hero({ navigate, openQuiz }) {
  const { home } = window.CANDERA;
  return (
    <header className="c-hero">
      <div className="c-hero__bg">
        <img src="../../assets/images/seashell-garden.jpg" alt="" aria-hidden="true" />
        <div className="c-hero__scrim" />
      </div>
      <div className="c-hero__content">
        <span className="c-hero__tag">{home.heroTag}</span>
        <h1 className="c-hero__headline">{home.heroHeadline}</h1>
        <p className="c-hero__sub">{home.heroSubheading}</p>
        <div className="c-hero__cta">
          <Button onClick={() => navigate({ name: "collection" })} icon={<IconArrowRight size={14} />}>Explore the Collection</Button>
          <button className="c-hero__link" onClick={openQuiz}>Take the Scent Quiz</button>
        </div>
      </div>
      <div className="c-hero__grain" />
    </header>
  );
}
Object.assign(window, { Hero });

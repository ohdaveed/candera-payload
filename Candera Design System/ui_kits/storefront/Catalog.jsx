/* Candera — catalog: FragranceProfile, ProductCard, ProductGrid */
function FragranceProfile({ profile, burnTime, atmosphere }) {
  const labels = [["top", "Top"], ["heart", "Heart"], ["base", "Base"]];
  return (
    <div className="c-frag">
      <p className="c-frag__kick">Fragrance Profile</p>
      <div className="c-frag__grid">
        {labels.map(([k, l]) => (
          <div key={k} className="c-frag__cell">
            <span className="c-frag__tier">{l}</span>{profile[k]}
          </div>
        ))}
      </div>
      <div className="c-frag__foot">
        <span className="c-frag__clock"><IconClock size={12} />{burnTime}</span>
        {atmosphere && <span className="c-frag__atm">{atmosphere}</span>}
      </div>
    </div>
  );
}

function ProductCard({ candle, onOpen, onAdd }) {
  return (
    <div className="c-card">
      <a href="#" className="c-card__photo" onClick={(e) => { e.preventDefault(); onOpen(candle); }}>
        <img src={candle.image} alt={candle.name} loading="lazy" />
        <div className="c-card__tags">
          {candle.tag && <Tag className="c-card__tag-float">{candle.tag}</Tag>}
          <span className="c-card__batch">Batch {candle.metadata.batch}</span>
        </div>
      </a>
      <div className="c-card__body">
        <div className="c-card__titlerow">
          <a href="#" onClick={(e) => { e.preventDefault(); onOpen(candle); }}><h3 className="c-card__name">{candle.name}</h3></a>
          <span className="c-card__price">${candle.price.toFixed(2)}</span>
        </div>
        <FragranceProfile profile={candle.scent_profile} burnTime={candle.metadata.burn_time} atmosphere={candle.atmosphere} />
        <Button variant="primary" size="block" onClick={() => onAdd(candle)}>Add to the Ritual</Button>
      </div>
    </div>
  );
}

function ProductGrid({ products, onOpen, onAdd }) {
  return (
    <div className="c-grid">
      {products.map((c) => <Reveal key={c.slug}><ProductCard candle={c} onOpen={onOpen} onAdd={onAdd} /></Reveal>)}
    </div>
  );
}
Object.assign(window, { FragranceProfile, ProductCard, ProductGrid });

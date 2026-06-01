/* Candera — product detail. Editorial: photo, narrative, scent, notes, price deferred. */
function ProductDetail({ candle, navigate, onAdd }) {
  if (!candle) return null;
  return (
    <main className="c-pd">
      <div className="c-pd__grid">
        <div className="c-pd__photo"><img src={candle.image} alt={candle.name} /></div>
        <div className="c-pd__info">
          <span className="c-pd__vessel">Vessel {candle.vessel}</span>
          <h1 className="c-pd__name">{candle.name}</h1>
          <p className="c-pd__tagline">{candle.tagline}</p>

          <div className="c-pd__block">
            <p className="c-pd__desc">{candle.description}</p>
          </div>

          <div className="c-pd__block">
            <p className="c-pd__label">Scent Profile</p>
            <div className="c-pd__scent">
              {Object.entries(candle.scent_profile).map(([tier, note]) => (
                <div key={tier} className="c-pd__scent-cell">
                  <dt>{tier}</dt><dd>{note}</dd>
                </div>
              ))}
            </div>
          </div>

          <div className="c-pd__block">
            <p className="c-pd__label">Fragrance Notes</p>
            <div className="c-pd__notes">
              {candle.notes.map((n) => <span key={n} className="c-pd__chip">{n}</span>)}
            </div>
          </div>

          <div className="c-pd__block">
            <p className="c-pd__label">Details</p>
            <ul className="c-pd__details">
              {candle.details.map((d) => <li key={d}>{d}</li>)}
            </ul>
            <p className="c-pd__meta">Burn time: {candle.metadata.burn_time} · Batch {candle.metadata.batch}</p>
          </div>

          <div className="c-pd__buy">
            <span className="c-pd__price">${candle.price.toFixed(2)}</span>
            <Button variant="primary" size="block" onClick={() => onAdd(candle)}>Add to the Ritual</Button>
          </div>
        </div>
      </div>
      <div className="c-pd__return">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate({ name: "collection" }); }}>← Return to Collection</a>
      </div>
    </main>
  );
}
Object.assign(window, { ProductDetail });

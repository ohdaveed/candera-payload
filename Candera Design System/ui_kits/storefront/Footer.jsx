/* Candera — footer. Warm linen, brand + nav + assistance columns. */
function Footer({ navigate }) {
  const { site } = window.CANDERA;
  const go = (r) => (e) => { e.preventDefault(); navigate(r); };
  return (
    <footer className="c-footer">
      <div className="c-footer__grid">
        <div className="c-footer__brand">
          <a href="#" onClick={go({ name: "home" })} className="c-footer__logo">{site.brandName}</a>
          <p className="c-footer__tagline">{site.footerTagline}</p>
          <div className="c-footer__social">
            <a href="#" aria-label="Instagram"><IconCamera size={20} /></a>
            <a href="#" aria-label="Etsy"><IconMsg size={20} /></a>
            <a href="#" aria-label="Website"><IconGlobe size={20} /></a>
          </div>
        </div>
        <div className="c-footer__col">
          <h5>Navigation</h5>
          <ul>
            <li><a href="#" onClick={go({ name: "collection" })}>Current Batch</a></li>
            <li><a href="#" onClick={go({ name: "about" })}>The Craft</a></li>
            <li><a href="#" onClick={go({ name: "inner" })}>Inner Circle</a></li>
            <li><a href="#" className="c-footer__ext">View All on Etsy <IconExternal size={10} /></a></li>
          </ul>
        </div>
        <div className="c-footer__col">
          <h5>Assistance</h5>
          <ul>
            <li className="is-muted">Shipping &amp; Returns</li>
            <li className="is-muted">Wholesale</li>
            <li><a href="#" onClick={go({ name: "inner" })}>Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="c-footer__bottom">
        <p>© {site.copyrightYear} {site.copyrightName}. All rights reserved.</p>
        <div className="c-footer__legal"><span>Privacy Policy</span><span>Terms of Service</span></div>
      </div>
    </footer>
  );
}
Object.assign(window, { Footer });

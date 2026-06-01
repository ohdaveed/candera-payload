/* Candera — shared primitives: Button, Badge, Eyebrow, Section, Divider, RuleLabel */
const { useState, useEffect, useRef } = React;

function Button({ variant = "primary", size = "md", children, icon, className = "", ...p }) {
  return <button className={`c-btn c-btn--${variant} c-btn--${size} ${className}`} {...p}>
    {children}{icon ? <span className="c-btn__icon">{icon}</span> : null}
  </button>;
}

const TAG_CLASS = {
  "Bestseller": "is-obsidian",
  "Limited Batch": "is-ember",
  "New Release": "is-rose",
};
function Tag({ children, className = "" }) {
  return <span className={`c-tag ${TAG_CLASS[children] || ""} ${className}`}>{children}</span>;
}

function Eyebrow({ children, tone = "ember", className = "" }) {
  return <span className={`c-eyebrow c-eyebrow--${tone} ${className}`}>{children}</span>;
}

/* Slow-fade-on-enter wrapper using IntersectionObserver (the brand entrance) */
function Reveal({ children, delay = 0, as = "div", className = "", ...p }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    // Fallback: never leave content permanently hidden if IO doesn't fire.
    const t = setTimeout(() => setSeen(true), 1400);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  const Comp = as;
  return <Comp ref={ref} className={`c-reveal ${seen ? "is-in" : ""} ${className}`}
    style={{ transitionDelay: `${delay}ms` }} {...p}>{children}</Comp>;
}

Object.assign(window, { Button, Tag, Eyebrow, Reveal });

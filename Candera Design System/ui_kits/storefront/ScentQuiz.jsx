/* Candera — Scent Quiz modal. 3 questions → recommended vessel. */
const QUIZ = [
  { q: "When do you light a candle?", a: [
    { t: "Morning, with coffee", k: "fresh" },
    { t: "Golden hour, unwinding", k: "warm" },
    { t: "Late, alone, in the dark", k: "moody" },
  ]},
  { q: "Your ideal room holds…", a: [
    { t: "Open windows & linen", k: "fresh" },
    { t: "Pressed flowers & soft light", k: "warm" },
    { t: "Deep shadows & old wood", k: "moody" },
  ]},
  { q: "A scent should feel…", a: [
    { t: "Clean and awake", k: "fresh" },
    { t: "Romantic and soft", k: "warm" },
    { t: "Grounded and private", k: "moody" },
  ]},
];
const QUIZ_MATCH = { fresh: "meadowlight-botanical", warm: "ever-after-glow", moody: "crimson-noir" };

function ScentQuiz({ onClose, onResult }) {
  const [step, setStep] = useState(0);
  const [tally, setTally] = useState({ fresh: 0, warm: 0, moody: 0 });
  const products = window.CANDERA.products;

  const pick = (k) => {
    const next = { ...tally, [k]: tally[k] + 1 };
    setTally(next);
    if (step < QUIZ.length - 1) { setStep(step + 1); }
    else {
      const winner = Object.entries(next).sort((a, b) => b[1] - a[1])[0][0];
      const match = products.find((p) => p.slug === QUIZ_MATCH[winner]);
      setStep(QUIZ.length); window.__quizMatch = match;
    }
  };

  const done = step >= QUIZ.length;
  const match = window.__quizMatch;

  return (
    <div className="c-modal" onClick={onClose}>
      <div className="c-quiz" onClick={(e) => e.stopPropagation()}>
        <button className="c-quiz__close" onClick={onClose} aria-label="Close"><IconX size={20} /></button>
        {!done ? (
          <React.Fragment>
            <div className="c-quiz__progress">
              {QUIZ.map((_, i) => <span key={i} className={i <= step ? "is-on" : ""} />)}
            </div>
            <Eyebrow>Scent Identification · {step + 1} of {QUIZ.length}</Eyebrow>
            <h2 className="c-quiz__q">{QUIZ[step].q}</h2>
            <div className="c-quiz__opts">
              {QUIZ[step].a.map((opt) => (
                <button key={opt.t} className="c-quiz__opt" onClick={() => pick(opt.k)}>{opt.t}</button>
              ))}
            </div>
          </React.Fragment>
        ) : (
          <div className="c-quiz__result">
            <Eyebrow>Your Ritual Match</Eyebrow>
            <div className="c-quiz__match">
              <img src={match.image} alt={match.name} />
              <div>
                <h2 className="c-quiz__matchname">{match.name}</h2>
                <p className="c-quiz__matchatm">{match.atmosphere}</p>
                <p className="c-quiz__matchtag">{match.tagline}</p>
              </div>
            </div>
            <Button variant="primary" size="block" onClick={() => { onResult(match); onClose(); }}>View this Vessel</Button>
          </div>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { ScentQuiz });

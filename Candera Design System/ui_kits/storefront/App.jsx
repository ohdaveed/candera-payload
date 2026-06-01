/* Candera — app shell: route state, cart toast, quiz modal */
function App() {
  const [route, setRoute] = useState({ name: "home" });
  const [quizOpen, setQuizOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const scrollerRef = useRef(null);

  const navigate = (r) => { setRoute(r); if (scrollerRef.current) scrollerRef.current.scrollTop = 0; };
  const openProduct = (candle) => navigate({ name: "product", slug: candle.slug });
  const addToCart = (candle) => {
    setCart((c) => [...c, candle.slug]);
    setToast(candle.name);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(null), 2200);
  };

  const products = window.CANDERA.products;
  const current = route.name === "product" ? products.find((p) => p.slug === route.slug) : null;

  let page;
  if (route.name === "home") page = <Home navigate={navigate} openQuiz={() => setQuizOpen(true)} onOpen={openProduct} onAdd={addToCart} />;
  else if (route.name === "collection") page = <Collection onOpen={openProduct} onAdd={addToCart} />;
  else if (route.name === "product") page = <ProductDetail candle={current} navigate={navigate} onAdd={addToCart} />;
  else if (route.name === "about") page = <About />;
  else if (route.name === "inner") page = <InnerCircle />;

  return (
    <div className="c-app" ref={scrollerRef}>
      <Nav route={route} navigate={navigate} openQuiz={() => setQuizOpen(true)} cartCount={cart.length} />
      {page}
      <Footer navigate={navigate} />
      {quizOpen && <ScentQuiz onClose={() => setQuizOpen(false)} onResult={openProduct} />}
      {toast && (
        <div className="c-toast">
          <IconCheck size={16} />
          <span><b>{toast}</b> added to the ritual</span>
        </div>
      )}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

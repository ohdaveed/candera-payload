import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  ChevronRight, 
  Menu, 
  X, 
  ArrowRight, 
  Instagram, 
  Mail, 
  Sparkles, 
  Star, 
  Clock, 
  CheckCircle2,
  Linkedin,
  Twitter,
  ExternalLink,
  ShieldCheck,
  Search,
  MessageSquare,
  Loader2,
  Send,
  Compass,
  ArrowUpRight
} from 'lucide-react';

// Static candle catalog representing our main batch items
const CANDLE_DATA = [
  {
    id: 'c1',
    name: 'High Desert',
    notes: { top: 'Crushed Sage', heart: 'Sandalwood', base: 'Palo Santo' },
    atmosphere: 'Sun-warmed & Grounding',
    price: 48,
    burnTime: '50-60 hrs',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&q=80&w=800',
    tag: 'Bestseller',
    etsyUrl: 'https://www.etsy.com/shop/CanderaCandles',
    batch: 'Batch 012'
  },
  {
    id: 'c2',
    name: 'Midnight Garden',
    notes: { top: 'Night Jasmine', heart: 'Moonflower', base: 'Damp Vetiver' },
    atmosphere: 'Ethereal & Mystical',
    price: 52,
    burnTime: '50-60 hrs',
    image: 'https://images.unsplash.com/photo-1603006905393-c3c2678128ec?auto=format&fit=crop&q=80&w=800',
    tag: 'Limited Batch',
    etsyUrl: 'https://www.etsy.com/shop/CanderaCandles',
    batch: 'Batch 009'
  },
  {
    id: 'c3',
    name: 'Morning Ember',
    notes: { top: 'Bergamot', heart: 'Black Pepper', base: 'Charred Cedar' },
    atmosphere: 'Crisp & Awakening',
    price: 48,
    burnTime: '50-60 hrs',
    image: 'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&q=80&w=800',
    tag: 'New Release',
    etsyUrl: 'https://www.etsy.com/shop/CanderaCandles',
    batch: 'Batch 014'
  }
];

// Expanded 5-question ritual path
const QUIZ_QUESTIONS = [
  { 
    id: 'q1',
    question: "Where do you find your deepest sense of calm?", 
    options: ["An ancient, sun-dappled forest", "A crisp, high-altitude desert", "A hidden, dew-covered garden", "A cozy study by the fire"] 
  },
  { 
    id: 'q2',
    question: "Select a sensory texture that resonates with you today.", 
    options: ["Rough-hewn linen", "Smooth, cold ceramic", "Aged, weathered leather", "Soft, wild silk"] 
  },
  { 
    id: 'q3',
    question: "What is your preferred ritual time?", 
    options: ["Early morning clarity", "Mid-day pause", "The golden hour", "The quiet of midnight"] 
  },
  { 
    id: 'q4',
    question: "Which atmosphere calls to your spirit?", 
    options: ["Mystical and Smokey", "Bright and Botanical", "Earthy and Grounded", "Clean and Ethereal"] 
  },
  { 
    id: 'q5',
    question: "What is the primary intention for your space?", 
    options: ["Focus and Creativity", "Deep Restoration", "Energy and Awakening", "Comfort and Intimacy"] 
  }
];

// Gemini API client-side helper utilizing exponential backoff
const callGeminiAPI = async (prompt, systemPrompt, isJson = false, jsonSchema = null) => {
  const apiKey = ""; // Left empty for automatic injection at runtime on Canvas
  const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
  const apiUrl = `${baseUrl}?key=${apiKey}`;

  let delay = 1000;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      };

      if (isJson && jsonSchema) {
        payload.generationConfig = {
          responseMimeType: "application/json",
          responseSchema: jsonSchema
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini service error: ${response.status}`);
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        return isJson ? JSON.parse(generatedText) : generatedText;
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Implement exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Scent Alchemist was unable to tune into your ritual. Please try again.");
};

// Graceful transition button redirecting securely to an Etsy listing
const RedirectButton = ({ url, children, className }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.open(url, '_blank');
      setIsRedirecting(false);
    }, 1500);
  };

  return (
    <button 
      onClick={handleClick}
      className={`${className} flex items-center justify-center gap-2 min-h-[56px] px-8 transition-all active:scale-95 disabled:opacity-70 group`}
      disabled={isRedirecting}
    >
      {isRedirecting ? (
        <span className="flex items-center gap-2 text-stone-800 italic animate-pulse font-serif">
          Preparing your vessel...
        </span>
      ) : (
        <>
          {children}
          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
};

// Advanced Scent Quiz using Gemini to dynamically generate customized scent profiles
const ScentQuiz = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const totalSteps = QUIZ_QUESTIONS.length;
  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  const handleOptionSelect = (option) => {
    const updatedAnswers = [...answers, { question: QUIZ_QUESTIONS[step].question, answer: option }];
    setAnswers(updatedAnswers);
    setStep(step + 1);
  };

  const handleQuizReset = () => {
    setStep(0);
    setAnswers([]);
    setEmail('');
    setQuizResult(null);
    setErrorMessage('');
  };

  const handleGenerateAlignment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const systemPrompt = `You are the master Scent Alchemist at Candera, a luxury, slow-living botanical candle studio founded by Olesia Plascencia.
    Analyze the customer's sensory answers and draft a personalized Alchemical Scent Portrait.
    Return a JSON response adhering strictly to the provided schema. Match them intelligently to one of our three core vessels: "High Desert", "Midnight Garden", or "Morning Ember".`;

    const userPrompt = `A customer seeking spiritual and sensory alignment has provided these answers:
    ${answers.map((a, i) => `${i+1}. ${a.question}: "${a.answer}"`).join('\n')}
    
    Please formulate their bespoke alignment portrait. Make the descriptions poetic, warm, evocative, and high-end editorial.`;

    const jsonSchema = {
      type: "OBJECT",
      properties: {
        candleName: { type: "STRING", description: "A poetic custom blend name based on their unique style (e.g. 'Smoky Silk & Amber')" },
        scentProfile: { type: "STRING", description: "Detailed narrative list of custom botanical scent notes" },
        atmosphere: { type: "STRING", description: "A evocative reading of the atmosphere this scent cultivates" },
        philosophy: { type: "STRING", description: "A slow-living philosophy paragraph written to match their answers" },
        customRitual: { type: "STRING", description: "A step-by-step personalized 1-minute meditation ritual to perform when lighting the candle" },
        matchedCandle: { type: "STRING", description: "The physical signature Candera candle that matches them best. Must be EXACTLY one of: 'High Desert', 'Midnight Garden', or 'Morning Ember'" }
      },
      required: ["candleName", "scentProfile", "atmosphere", "philosophy", "customRitual", "matchedCandle"]
    };

    try {
      const result = await callGeminiAPI(userPrompt, systemPrompt, true, jsonSchema);
      setQuizResult(result);
    } catch (err) {
      setErrorMessage("The air is still. We couldn't catch the alignment. Let's try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const matchedProduct = quizResult 
    ? CANDLE_DATA.find(c => c.name.toLowerCase() === quizResult.matchedCandle.toLowerCase()) || CANDLE_DATA[0]
    : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#1A1A1B]/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#F5F2ED] w-full max-w-xl p-8 md:p-12 relative overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-300 my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors p-2 z-10">
          <X size={24} />
        </button>

        <div className="absolute top-0 left-0 w-full h-1.5 bg-stone-100">
          <div className="h-full bg-[#9A91A4] transition-all duration-700 ease-in-out" style={{ width: `${progress}%` }} />
        </div>

        {errorMessage && (
          <div className="text-rose-700 bg-rose-50 border border-rose-100 p-4 rounded-sm text-sm text-center font-light mt-4">
            {errorMessage}
            <button onClick={handleQuizReset} className="block mx-auto mt-2 underline text-xs font-semibold uppercase tracking-wider">Restart Quiz</button>
          </div>
        )}

        {!quizResult && !isLoading && !errorMessage && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step < totalSteps ? (
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#9A91A4] font-bold">Inquiry {step + 1} / {totalSteps}</span>
                  <h3 className="text-2xl md:text-3xl font-serif leading-tight text-[#1A1A1B]">{QUIZ_QUESTIONS[step].question}</h3>
                </div>
                <div className="grid gap-3">
                  {QUIZ_QUESTIONS[step].options.map((option, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleOptionSelect(option)}
                      className="text-left p-5 border border-stone-200 hover:border-[#9A91A4] hover:bg-white transition-all group flex justify-between items-center min-h-[64px]"
                    >
                      <span className="text-stone-700 font-light italic">{option}</span>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9A91A4]" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8 text-center">
                <div className="space-y-4">
                  <Sparkles className="mx-auto text-[#9A91A4]" size={32} strokeWidth={1} />
                  <h3 className="text-3xl font-serif text-[#1A1A1B]">Discovery Complete.</h3>
                  <p className="text-stone-500 font-light text-sm">Join the Inner Circle to unlock your matched scent, generate a personalized ritual portrait, and receive 15% off your first batch.</p>
                </div>
                <form onSubmit={handleGenerateAlignment} className="space-y-4">
                  <input 
                    type="email" required placeholder="ritual@example.com"
                    className="w-full bg-transparent border-b border-stone-300 py-3 text-center focus:border-[#9A91A4] outline-none placeholder:text-stone-300 font-light text-lg"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                  <button type="submit" className="w-full bg-[#1A1A1B] text-white py-5 uppercase tracking-widest text-[11px] font-bold hover:bg-[#9A91A4] transition-colors shadow-lg">
                    Generate Bespoke Alignment
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="py-20 text-center space-y-4 animate-pulse">
            <Loader2 className="animate-spin mx-auto text-[#9A91A4]" size={36} strokeWidth={1.5} />
            <p className="font-serif italic text-stone-600 text-lg">Blending botanicals and crafting your custom sensory profile...</p>
            <p className="text-xs tracking-widest text-[#9A91A4] uppercase font-bold">Consulting the Scent Alchemist</p>
          </div>
        )}

        {quizResult && !isLoading && (
          <div className="space-y-8 animate-in fade-in duration-700 max-h-[80vh] overflow-y-auto pr-2">
            <div className="text-center space-y-2 border-b border-stone-200 pb-6">
              <CheckCircle2 className="mx-auto text-emerald-700 mb-2" size={36} strokeWidth={1} />
              <span className="text-[10px] tracking-[0.3em] text-[#9A91A4] uppercase font-bold">Your Alchemical Scent Match</span>
              <h3 className="text-3xl font-serif italic text-[#1A1A1B]">{quizResult.candleName}</h3>
              <p className="text-xs text-stone-400 uppercase tracking-widest">A bespoke formulation for {email}</p>
            </div>

            <div className="space-y-6 text-sm text-stone-700 font-light">
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-stone-900 font-semibold font-sans">Sensory Profile</h4>
                <p className="italic text-stone-600 font-serif text-base leading-relaxed">"{quizResult.scentProfile}"</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-stone-900 font-semibold font-sans">Cultivated Atmosphere</h4>
                <p>{quizResult.atmosphere}</p>
              </div>

              <div className="space-y-1 bg-stone-50 p-4 border-l-2 border-[#9A91A4]">
                <h4 className="text-xs uppercase tracking-wider text-[#9A91A4] font-semibold font-sans">The Philosophy</h4>
                <p className="italic font-serif leading-relaxed text-stone-600 text-sm">{quizResult.philosophy}</p>
              </div>

              <div className="space-y-2 bg-white p-5 border border-stone-200">
                <h4 className="text-xs uppercase tracking-wider text-stone-950 font-bold tracking-widest flex items-center gap-1.5"><Compass size={14} className="text-[#9A91A4]" /> Your Lighting Ritual</h4>
                <p className="text-xs leading-relaxed whitespace-pre-line text-stone-600">{quizResult.customRitual}</p>
              </div>
            </div>

            {matchedProduct && (
              <div className="bg-stone-100 p-5 border border-stone-200 space-y-4">
                <span className="text-[9px] tracking-widest uppercase text-[#9A91A4] font-bold block">Available Signature Vessel</span>
                <div className="flex gap-4 items-center">
                  <img src={matchedProduct.image} alt={matchedProduct.name} className="w-16 h-20 object-cover" />
                  <div className="flex-grow">
                    <h5 className="font-serif text-lg italic text-[#1A1A1B]">{matchedProduct.name}</h5>
                    <p className="text-xs text-stone-500 font-light">{matchedProduct.atmosphere}</p>
                    <p className="text-xs font-semibold text-stone-800 mt-1">${matchedProduct.price} — {matchedProduct.burnTime}</p>
                  </div>
                </div>
                <RedirectButton 
                  url={matchedProduct.etsyUrl}
                  className="w-full bg-[#1A1A1B] text-white uppercase tracking-widest text-[10px] font-bold hover:bg-[#9A91A4] transition-all shadow-sm"
                >
                  Acquire Matched Scent (15% Applied)
                </RedirectButton>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
              <button 
                onClick={handleQuizReset}
                className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Retake Path
              </button>
              <button 
                onClick={onClose}
                className="text-[#1A1A1B] border-b border-[#1A1A1B] pb-0.5 text-xs uppercase tracking-wider font-semibold hover:text-[#9A91A4] hover:border-[#9A91A4] transition-all"
              >
                Close Vessel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Elegant floating Scent Oracle bot for deep atmospheric storytelling and ingredient lookup
const ScentOracle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'oracle', text: 'Peace be with you, seeker. I am the Candera Scent Oracle. Ask me of botanical notes, calming rituals, or our slow-craft methodology.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const systemPrompt = `You are the Scent Oracle of Candera.
    You are a gentle, poetic, and incredibly insightful spiritual guide specializing in aromatherapy, mental calm, and botanical elements.
    Keep your responses elegant, serene, relatively brief (2-4 sentences), and aligned with "slow-living" values. 
    You have deep knowledge of the Candera candles:
    1. "High Desert" (Sage, Sandalwood, Palo Santo. Atmosphere: Sun-warmed & Grounding. Price: $48).
    2. "Midnight Garden" (Night Jasmine, Moonflower, Damp Vetiver. Atmosphere: Ethereal & Mystical. Price: $52).
    3. "Morning Ember" (Bergamot, Black Pepper, Cedar. Atmosphere: Crisp & Awakening. Price: $48).
    You also know that Olesia Plascencia, our founder, makes candles carefully by hand in 72-hour intervals using organic soy wax and pure cotton wicks in the High Desert.
    Speak with a sense of peace. Do not use generic chatbot phrases or lists. Use prose. No emojis.`;

    try {
      const response = await callGeminiAPI(userMessage, systemPrompt);
      setMessages(prev => [...prev, { role: 'oracle', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'oracle', text: "The smoke is heavy, and my senses are clouded. Let us pause and reconnect in a moment." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[160] bg-[#1A1A1B] hover:bg-[#9A91A4] text-[#F5F2ED] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center border border-stone-700/50"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-32px)] h-[500px] bg-[#F5F2ED] border border-stone-200 shadow-2xl z-[160] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#1A1A1B] text-white p-5 flex justify-between items-center border-b border-stone-800">
            <div>
              <h4 className="font-serif italic text-lg text-stone-100 flex items-center gap-1.5"><Sparkles size={16} className="text-[#9A91A4]" /> Scent Oracle</h4>
              <p className="text-[9px] uppercase tracking-widest text-[#9A91A4] font-bold">Guiding your sensory path</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div 
                  className={`p-4 text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-[#9A91A4] text-white font-light' 
                      : 'bg-white text-stone-700 border border-stone-200/60 font-serif italic'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                  {m.role === 'user' ? 'Seeker' : 'Oracle'}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-stone-400 text-xs italic font-serif">
                <Loader2 className="animate-spin text-[#9A91A4]" size={12} />
                Oracle is reflecting on your intention...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Seek guidance (e.g. Sage properties)..."
              className="flex-grow bg-transparent border-b border-stone-200 py-2 px-1 text-xs outline-none focus:border-[#9A91A4] text-stone-800 placeholder-stone-400 font-light"
            />
            <button 
              type="submit"
              disabled={isTyping}
              className="p-2 bg-[#1A1A1B] hover:bg-[#9A91A4] text-white transition-colors flex items-center justify-center"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// Ambient Daily Breathwork Meditation widget leveraging the Gemini API
const DailyRitualWidget = () => {
  const [mood, setMood] = useState('Grounded Focus');
  const [ritual, setRitual] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const moods = ['Grounded Focus', 'Midnight Unwinding', 'Morning Awakening', 'Creative Vision'];

  const handleGenerateRitual = async () => {
    setIsLoading(true);
    const systemPrompt = `You are a sensory monk and master of ritual aromatherapy at Candera.
    Compose a personalized, lyrical, and comforting 1-minute breathing and candle-lighting meditation based on the chosen intention.
    Maintain an exceptionally soothing, tranquil tone. Write in one short, impactful paragraph (3-4 sentences max). Do not use lists or bullet points. Avoid emojis.`;

    const userPrompt = `I would like to practice a 1-minute slow-living ritual for: "${mood}". Tell me how to center myself, breathe, and focus my intention with my Candera vessel.`;

    try {
      const result = await callGeminiAPI(userPrompt, systemPrompt);
      setRitual(result);
    } catch (err) {
      setRitual("The air is still. Breathe in deeply for four counts, hold, and release. Find peace in this singular quiet moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 p-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <span className="text-[10px] tracking-[0.4em] uppercase text-[#9A91A4] font-bold block">Interactive Ritual</span>
        <h4 className="text-3xl font-serif italic text-stone-900">Atmospheric Alignment</h4>
        <p className="text-xs text-stone-500 max-w-md mx-auto">Select your current intention to formulate a customized 1-minute lighting meditation.</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {moods.map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-bold transition-all border ${
              mood === m 
                ? 'bg-[#1A1A1B] text-white border-[#1A1A1B]' 
                : 'text-stone-500 border-stone-200 hover:border-[#9A91A4]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="text-center pt-2">
        <button
          onClick={handleGenerateRitual}
          disabled={isLoading}
          className="bg-stone-50 hover:bg-[#9A91A4] hover:text-white border border-stone-200 text-stone-800 text-[11px] uppercase tracking-widest font-bold py-3 px-8 transition-all inline-flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={12} /> : <Compass size={12} />}
          {isLoading ? "Consulting Scent Alchemist..." : "Formulate My Minute"}
        </button>
      </div>

      {ritual && (
        <div className="border-t border-stone-100 pt-6 animate-in fade-in duration-500 text-center">
          <p className="font-serif italic text-stone-600 leading-relaxed text-sm max-w-lg mx-auto">
            "{ritual}"
          </p>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [scrolled, setScrolled] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1B] font-sans antialiased selection:bg-[#9A91A4]/30 pb-20">
      
      {/* Jakob's Law: Standardized navigation placement for user familiarity. */}
      <nav className={`fixed top-0 w-full z-[150] transition-all duration-500 ${scrolled || view !== 'home' ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button className="md:hidden p-2" onClick={() => setMobileMenu(true)}><Menu size={20} /></button>
            <div className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              <button onClick={() => setView('home')} className={`hover:text-[#1A1A1B] ${view === 'home' ? 'text-[#1A1A1B] border-b border-[#1A1A1B]' : ''}`}>Collection</button>
              <button onClick={() => setView('process')} className={`hover:text-[#1A1A1B] ${view === 'process' ? 'text-[#1A1A1B] border-b border-[#1A1A1B]' : ''}`}>The Craft</button>
            </div>
          </div>

          <h1 onClick={() => setView('home')} className="text-2xl font-serif tracking-tighter cursor-pointer font-bold hover:opacity-70 transition-opacity absolute left-1/2 -translate-x-1/2">
            CANDERA
          </h1>

          <div className="flex items-center gap-4">
            <button className="text-stone-500 hover:text-[#1A1A1B] p-2 transition-colors" onClick={() => setIsQuizOpen(true)}>
              <Compass size={20} strokeWidth={1.5} />
            </button>
            <button className="text-stone-500 hover:text-[#1A1A1B] p-2 transition-colors relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#9A91A4] rounded-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {view === 'home' ? (
        <main className="animate-in fade-in duration-1000">
          {/* Hick's Law: Minimalist Hero with a single primary CTA. */}
          <header className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&q=80&w=2000" alt="Atmospheric candle" className="w-full h-full object-cover scale-105 brightness-[0.7] transition-transform duration-[10s] hover:scale-100" />
              <div className="absolute inset-0 bg-stone-900/20" />
            </div>
            
            <div className="relative z-10 text-center text-white px-6 space-y-8 max-w-4xl">
              <span className="text-[11px] tracking-[0.5em] uppercase font-bold animate-in fade-in duration-1000">The Ritual of Intent</span>
              <h2 className="text-5xl md:text-8xl font-serif italic leading-tight animate-in slide-in-from-bottom-8 duration-1000 delay-200">
                An invitation to <br /> slow down.
              </h2>
              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-[#1A1A1B] text-[11px] px-14 py-5 uppercase tracking-[0.2em] font-bold hover:bg-[#F5F2ED] transition-all shadow-2xl min-h-[60px] w-full sm:w-auto"
                >
                  Explore the Collection
                </button>
                <button 
                  onClick={() => setIsQuizOpen(true)}
                  className="bg-transparent border border-white text-white hover:bg-white/10 text-[11px] px-14 py-5 uppercase tracking-[0.2em] font-bold transition-all min-h-[60px] w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Scent Finder
                </button>
              </div>
            </div>
          </header>

          <section id="collection" className="py-32 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                <div className="space-y-4">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-[#9A91A4] font-bold">The Current Batch</span>
                  <h3 className="text-4xl md:text-6xl font-serif italic">Rooted in Earth.</h3>
                </div>
                <button onClick={() => setIsQuizOpen(true)} className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-bold group border-b border-[#1A1A1B] pb-2">
                  <Sparkles size={14} className="text-[#9A91A4]" /> AI Scent Matchmaker <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Law of Common Region & Proximity: Cards use subtle borders and tight clustering of data. */}
              <div className="grid md:grid-cols-3 gap-x-12 gap-y-24">
                {CANDLE_DATA.map((candle) => (
                  <div key={candle.id} className="group flex flex-col border border-transparent hover:border-stone-100 p-2 transition-all">
                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-50 mb-8">
                      <img src={candle.image} alt={candle.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-white/95 px-3 py-1 text-[9px] uppercase tracking-widest font-bold shadow-sm">{candle.tag}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6 flex-grow">
                      <div className="flex justify-between items-baseline border-b border-stone-100 pb-4">
                        <h4 className="text-3xl font-serif italic">{candle.name}</h4>
                        <span className="text-stone-400 font-light tracking-widest">${candle.price}</span>
                      </div>
                      
                      {/* Law of Proximity: Information is tightly grouped for cognitive ease. */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-[9px] uppercase tracking-widest font-bold text-stone-600">
                          <div><span className="text-[#9A91A4] block mb-1">Top</span> {candle.notes.top}</div>
                          <div><span className="text-[#9A91A4] block mb-1">Heart</span> {candle.notes.heart}</div>
                          <div><span className="text-[#9A91A4] block mb-1">Base</span> {candle.notes.base}</div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-stone-400 font-bold italic">
                          <span className="flex items-center gap-1"><Clock size={12} /> {candle.burnTime}</span>
                          <span className="text-[#9A91A4]">{candle.atmosphere}</span>
                        </div>
                      </div>

                      <RedirectButton 
                        url={candle.etsyUrl}
                        className="w-full bg-[#1A1A1B] text-white uppercase tracking-widest text-[10px] font-bold hover:bg-[#9A91A4] transition-all shadow-sm"
                      >
                        Acquire on Etsy
                      </RedirectButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 px-6 md:px-12 bg-stone-100 border-t border-stone-200">
            <div className="max-w-7xl mx-auto">
              <DailyRitualWidget />
            </div>
          </section>

          {/* Social Proof: Aesthetic-Usability Effect enhanced with clean testimonials. */}
          <section className="py-32 px-6 md:px-12 bg-stone-50 border-y border-stone-200">
             <div className="max-w-7xl mx-auto text-center space-y-16">
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#9A91A4] font-bold">Shared Rituals</span>
                <div className="grid md:grid-cols-3 gap-12">
                   {[
                     { quote: "The scent profile is unlike anything mass-produced. It fills the room without overwhelming.", author: "Elena R.", loc: "Verified Ritualist" },
                     { quote: "I reuse the stoneware vessels for my succulents. Truly objects of art.", author: "James T.", loc: "Repeat Collector" },
                     { quote: "High Desert is the soul of my living room. A ritual I look forward to daily.", author: "Sarah L.", loc: "Verified Ritualist" }
                   ].map((test, i) => (
                     <div key={i} className="space-y-6">
                        <div className="flex justify-center gap-1 text-[#9A91A4]">
                           {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                        <p className="text-xl font-serif italic text-stone-600">"{test.quote}"</p>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1B]">— {test.author}</p>
                          <div className="flex items-center justify-center gap-1 text-[8px] text-[#9A91A4] font-bold uppercase tracking-widest">
                            <ShieldCheck size={10} /> {test.loc}
                          </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Peak-End Rule: High-contrast email capture before the footer. */}
          <section className="py-40 px-6 md:px-12 bg-[#1A1A1B] text-[#F5F2ED]">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <Mail className="mx-auto text-[#9A91A4]/50" size={40} strokeWidth={1} />
              <div className="space-y-4">
                <h3 className="text-4xl md:text-6xl font-serif italic">Join the Inner Circle.</h3>
                <p className="text-stone-400 font-light max-w-xl mx-auto">
                  Our micro-batches sell out in days. Receive early access to new scent drops and personal ritual invitations.
                </p>
              </div>
              <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" placeholder="ritual@email.com"
                  className="flex-1 bg-transparent border-b border-stone-700 py-3 text-[#F5F2ED] outline-none focus:border-[#9A91A4] transition-colors placeholder:text-stone-600 font-light text-lg"
                />
                <button className="bg-[#F5F2ED] text-[#1A1A1B] px-10 py-5 uppercase tracking-widest text-[11px] font-bold hover:bg-[#9A91A4] hover:text-white transition-all shadow-xl min-h-[60px]">
                  Request Entry
                </button>
              </form>
            </div>
          </section>
        </main>
      ) : (
        <section className="pt-40 px-6 md:px-12 max-w-7xl mx-auto animate-in fade-in duration-700">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="space-y-8">
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#9A91A4] font-bold">The Methodology</span>
              <h2 className="text-5xl md:text-7xl font-serif italic leading-tight">72 Hours of Intent.</h2>
              <p className="text-stone-500 font-light text-xl leading-relaxed">
                In a world that demands speed, we choose the opposite. Our candles are cultivated through a series of slow, deliberate rituals that ensure the highest fragrance throw and the cleanest burn.
              </p>
            </div>
            <div className="aspect-[4/5] overflow-hidden bg-stone-100">
              <img src="https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&q=80&w=1200" alt="Craft process" className="w-full h-full object-cover grayscale opacity-90" />
            </div>
          </div>
        </section>
      )}

      <footer className="py-24 px-6 md:px-12 bg-[#F5F2ED] border-t border-stone-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2 space-y-8">
            <h4 className="text-3xl font-serif font-bold tracking-tighter">CANDERA</h4>
            <p className="text-stone-500 max-w-sm text-sm leading-relaxed font-light italic">
              Cultivating intentional living through scent and micro-batch artisanry by Olesia Plascencia. Based in the high desert, shared everywhere.
            </p>
            <div className="flex gap-6 text-stone-400">
              <Instagram size={20} className="hover:text-[#1A1A1B] cursor-pointer transition-colors" />
              <Twitter size={20} className="hover:text-[#1A1A1B] cursor-pointer transition-colors" />
              <Linkedin size={20} className="hover:text-[#1A1A1B] cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400">Navigation</h5>
            <ul className="text-stone-600 text-xs space-y-4 font-semibold uppercase tracking-widest">
              <li onClick={() => setView('home')} className="hover:text-[#9A91A4] cursor-pointer">Collection</li>
              <li onClick={() => setView('process')} className="hover:text-[#9A91A4] cursor-pointer">The Craft</li>
              <li className="hover:text-[#9A91A4] cursor-pointer" onClick={() => setIsQuizOpen(true)}>Scent Quiz</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="text-[11px] uppercase tracking-[0.2em] font-bold text-stone-400">Assistance</h5>
            <ul className="text-stone-600 text-xs space-y-4 font-semibold uppercase tracking-widest">
              <li className="hover:text-[#9A91A4] cursor-pointer">Shipping</li>
              <li className="hover:text-[#9A91A4] cursor-pointer">Wholesale</li>
              <li className="hover:text-[#9A91A4] cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Embedded Scent Quiz Component */}
      <ScentQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      
      {/* Floating AI Scent Oracle */}
      <ScentOracle />
      
      {mobileMenu && (
        <div className="fixed inset-0 z-[200] bg-white p-8 animate-in slide-in-from-left duration-300">
          <div className="flex justify-between items-center mb-16">
            <span className="font-serif text-2xl font-bold tracking-tighter">CANDERA</span>
            <button onClick={() => setMobileMenu(false)} className="p-2"><X /></button>
          </div>
          <nav className="flex flex-col gap-10 text-3xl font-serif italic">
            <button onClick={() => { setView('home'); setMobileMenu(false); }}>The Batch</button>
            <button onClick={() => { setView('process'); setMobileMenu(false); }}>The Craft</button>
            <button onClick={() => { setIsQuizOpen(true); setMobileMenu(false); }}>Scent Quiz</button>
          </nav>
        </div>
      )}
    </div>
  );
}
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { 
  ShieldCheck, ShieldAlert, UploadCloud, ScanEye, Mic, 
  Download, AlertTriangle, CheckCircle2, XCircle, Activity,
  Smartphone, Sparkles, Ear, BarChart3, Globe2, Zap,
  Share2, ChevronRight, Image as ImageIcon, Mic as MicIcon
} from "lucide-react";

// --- Types ---
type RiskResult = {
  risk_level: "RED" | "YELLOW" | "GREEN";
  confidence?: number;
  red_flags?: { type: string; evidence: string }[];
  one_sentence_warning: string;
  safe_actions?: string[];
};

type Tab = "image" | "voice";

export default function HomePage() {
  // Deploy route
  const API = process.env.NEXT_PUBLIC_API_BASE;
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>("image");
  
  // Image State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Common State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [cardUrl, setCardUrl] = useState<string>("");
  
  // Fake Community Stats State (Live Counter)
  const [reportCount, setReportCount] = useState(1241);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // --- Handlers: Image ---
  function handleFile(f: File) {
    setFile(f);
    setResult(null);
    setError("");
    setCardUrl("");
    setPreviewUrl(URL.createObjectURL(f));
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    handleFile(f);
  }

  // --- FEATURE: ONE-CLICK DEMO ---
  async function loadSampleImage(filename: string) {
    setLoading(true);
    try {
      const response = await fetch(`/${filename}`);
      const blob = await response.blob();
      const f = new File([blob], filename, { type: blob.type });
      handleFile(f);
      // Auto analyze 
      setTimeout(() => analyzeImageWithFile(f), 500); 
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  async function analyzeImageWithFile(f: File) {
    setLoading(true);
    setError("");
    setCardUrl("");
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API}/analyze-image`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Aegis Core disconnected.");
      const data = (await res.json()) as RiskResult;
      handleSuccess(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeImage() {
    if (!file) return;
    await analyzeImageWithFile(file);
  }

  // --- Handlers: Voice ---
  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Voice not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setTranscript("");
    setError("");
    setResult(null);

    recognition.start();

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      // Don't stop immediately, wait for processing or user toggle in a real app, 
      // but for this demo flow, we process on result. 
      // To simulate "wait until done", we show text first.
      setIsListening(false);
      analyzeVoice(text);
    };

    recognition.onerror = (event: any) => {
      setError("Voice recognition failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  async function analyzeVoice(text: string) {
    if (!text) return;
    setLoading(true);
    setError("");
    setCardUrl("");

    try {
      const res = await fetch(`${API}/voice-guardian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      
      if (!res.ok) throw new Error("Aegis Voice Core disconnected.");
      const data = (await res.json()) as RiskResult;
      handleSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Common Logic ---
  function handleSuccess(data: RiskResult) {
    setResult(data);
    if (data.risk_level === "RED" && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 500]);
    }
    if (data.risk_level === "RED" && data.one_sentence_warning) {
      playVoiceWarning(data.one_sentence_warning);
    }
    if (data.risk_level === "RED") setReportCount(c => c + 1);
  }

  function playVoiceWarning(text?: string) {
    const txt = text || result?.one_sentence_warning;
    if (!txt) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = "en-US"; 
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  async function generateCard() {
    if (!cardRef.current || !result) return;
    setTimeout(async () => {
      const canvas = await html2canvas(cardRef.current!, { scale: 2, backgroundColor: null, useCORS: true });
      const dataUrl = canvas.toDataURL("image/png");
      setCardUrl(dataUrl);
      
      // Auto download for better UX
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'aegis-safe-card.png';
      link.click();
    }, 100);
  }

  // --- UI Theme Config  ---
  const theme = useMemo(() => {
    if (!result) return null;
    const configs = {
      RED: {
        color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
        icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
        title: "CRITICAL RISK", badge: "bg-red-100 text-red-700",
        summaryBg: "bg-red-50/50"
      },
      YELLOW: {
        color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
        icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
        title: "CAUTION ADVISED", badge: "bg-amber-100 text-amber-800",
        summaryBg: "bg-amber-50/50"
      },
      GREEN: {
        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
        icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
        title: "SAFE TO PROCEED", badge: "bg-emerald-100 text-emerald-700",
        summaryBg: "bg-emerald-50/50"
      }
    };
    return configs[result.risk_level];
  }, [result]);

  return (
    <main className="h-screen w-screen bg-slate-50 text-slate-900 font-sans flex flex-col overflow-hidden">
      
      {/* --- 1. TOP BAR --- */}
      <header className="bg-white border-b border-slate-200 flex-none z-50 shadow-sm h-16 animate-slideDown">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Logo Image */}
            <img src="/aegis-share_logo.png" alt="Aegis Logo" className="h-8 w-auto object-contain" />
            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>
            <span className="text-sm font-semibold text-slate-500 hidden sm:block">Horizon Hacks 2025</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com/trunghafromvietnam/aegis-share" target="_blank" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition">
              GitHub
            </a>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
              Beta v1.0
            </span>
          </div>
        </div>
      </header>

      {/* --- 2. HERO --- */}
      <section className="flex-none bg-white border-b border-slate-100 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
           {/* Title Animation: Slide Down */}
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 animate-slideDown">
             The <span className="text-indigo-600">3-Second Bodyguard</span> Against SpyLoans
           </h1>
           {/* Description Animation: Fade In Up with delay */}
           <p className="text-slate-500 text-sm max-w-2xl mx-auto animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s' }}>
             Instantly detect predatory lending traps, hidden fees, and debt-shaming threats via AI.
             <span className="hidden sm:inline"> No install required. Privacy first.</span>
           </p>
        </div>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid lg:grid-cols-12 gap-8 overflow-hidden">
        
        {/* === LEFT COLUMN: INPUT === */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-scaleIn opacity-0" style={{ animationDelay: '0.3s' }}>
          
          {/* TABS HEADER */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => {setActiveTab('image'); setResult(null);}}
              className={`cursor-pointer flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'image' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <ImageIcon className="w-4 h-4" /> Image Scan
            </button>
            <button 
              onClick={() => {setActiveTab('voice'); setResult(null);}}
              className={`cursor-pointer flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'voice' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <MicIcon className="w-4 h-4" /> Voice Guardian
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col min-h-0 overflow-y-auto">
            
            {/* --- MODE: IMAGE SCANNER --- */}
            {activeTab === 'image' && (
              <div className="flex flex-col h-full gap-4">
                <div className={`
                  flex-1 relative group rounded-xl border-2 border-dashed transition-all duration-300 bg-slate-50/50
                  flex flex-col justify-center overflow-hidden min-h-[250px]
                  ${dragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400'}
                `}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                >
                  {!file ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 bg-white text-indigo-600 rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">Upload Screenshot</h3>
                      <p className="text-slate-400 text-xs mb-4">JPG or PNG. We detect dark patterns.</p>
                      <label className="cursor-pointer px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                        Select File
                        <input type="file" className="hidden" accept="image/*" onChange={onPickFile} />
                      </label>
                    </div>
                  ) : (
                    <div className="w-full h-full relative bg-slate-100 flex flex-col">
                      <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
                         <img src={previewUrl} alt="Upload" className="w-full h-auto rounded-lg shadow-sm border border-slate-200" />
                      </div>
                      <button 
                        onClick={() => {setFile(null); setPreviewUrl(""); setResult(null);}}
                        className="cursor-pointer absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition z-10 shadow-lg"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* SAMPLES & ACTION */}
                <div className="flex-none space-y-4">
                  {!file && !loading && (
                    <div className="flex flex-wrap gap-2 justify-center items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Demo:</span>
                      {[1, 2, 3].map((i) => (
                        <button 
                          key={i}
                          onClick={() => loadSampleImage(`sample${i}.png`)} 
                          className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 text-xs font-semibold rounded-md transition shadow-sm"
                        >
                          Scam #{i}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={analyzeImage}
                    disabled={!file || loading}
                    className={`
                      cursor-pointer w-full py-3.5 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all
                      ${!file || loading 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25'}
                    `}
                  >
                    {loading ? (
                      <><Activity className="w-5 h-5 animate-spin" /> Scanning...</>
                    ) : (
                      <><ScanEye className="w-5 h-5" /> Analyze Risks</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* --- MODE: VOICE GUARDIAN --- */}
            {activeTab === 'voice' && (
              <div className="flex flex-col h-full items-center justify-center text-center space-y-8 relative animate-fadeIn">
                
                {/* Dynamic Header */}
                <div className="z-10 transition-all duration-300">
                  <h3 className={`text-xl font-bold transition-colors ${isListening ? 'text-indigo-600' : 'text-slate-900'}`}>
                     {isListening ? "Listening..." : "Tell Your Story"}
                  </h3>
                  {!isListening && (
                    <p className="text-slate-500 text-sm mt-2">
                       Tap to speak. Aegis will listen until you stop.
                    </p>
                  )}
                </div>

                {/* Siri-style Button */}
                <div className="relative">
                   {isListening && (
                     <>
                       <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                       <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-10 duration-2000 delay-150"></div>
                     </>
                   )}
                   <button 
                    onClick={isListening ? () => setIsListening(false) : startListening}
                    className={`
                      relative z-20 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl
                      ${isListening 
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white scale-110 ring-4 ring-indigo-100' 
                        : 'bg-white border-4 border-slate-50 text-indigo-600 hover:scale-105 hover:border-indigo-50'}
                    `}
                  >
                    {isListening ? (
                       <div className="flex gap-1 h-8 items-end">
                          <span className="w-1.5 bg-white rounded-full animate-[music-bar_1s_ease-in-out_infinite] h-4"></span>
                          <span className="w-1.5 bg-white rounded-full animate-[music-bar_1.2s_ease-in-out_infinite_0.1s] h-8"></span>
                          <span className="w-1.5 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_0.2s] h-6"></span>
                       </div>
                    ) : <Mic className="w-10 h-10" />}
                  </button>
                </div>

                {/* Transcript Area */}
                <div className="w-full min-h-[80px] flex items-center justify-center">
                   {transcript ? (
                     <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl w-full text-slate-700 italic text-sm animate-fadeIn">
                       "{transcript}"
                     </div>
                   ) : (
                     !isListening && (
                      <div className="text-xs text-slate-400 border border-dashed border-slate-200 p-2 rounded-lg">
                        Try: "They want my contacts" or "Is 20% fee legal?"
                      </div>
                     )
                   )}
                </div>

                {loading && (
                  <div className="absolute bottom-4 flex items-center gap-2 text-indigo-600 text-sm font-semibold animate-pulse">
                     <Sparkles className="w-4 h-4" /> Processing speech...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: RESULTS === */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative animate-scaleIn opacity-0" style={{ animationDelay: '0.4s' }}>
          
          {/* Header Bar inside Right Column */}
          <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-2 text-slate-500">
                {activeTab === 'image' ? <Smartphone className="w-4 h-4" /> : <Ear className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase tracking-wide">Analysis Result</span>
             </div>
             {result && (
               <button 
                 onClick={generateCard}
                 className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm"
               >
                 <Share2 className="w-3.5 h-3.5" />
                 Save Card
               </button>
             )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 relative">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="text-slate-400 font-semibold">Ready to guard</h3>
                 <p className="text-xs text-slate-400 max-w-xs mt-2">
                   Results will appear here. We check for hidden fees, coercion, and dangerous permissions.
                 </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn pb-10">
                
                {/* 1. PRIMARY RISK CARD */}
                <div className={`rounded-xl border ${theme?.border} overflow-hidden shadow-sm`}>
                  <div className={`p-6 ${theme?.bg}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-black/5">
                           {theme?.icon}
                        </div>
                        <div>
                          <h2 className={`text-xl font-bold ${theme?.color}`}>{theme?.title}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500 uppercase">Confidence:</span>
                            <div className="h-1.5 w-24 bg-slate-200 rounded-full overflow-hidden">
                               <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(result.confidence || 0) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{((result.confidence || 0) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide border ${theme?.border} ${theme?.badge}`}>
                        {result.risk_level}
                      </span>
                    </div>

                    <div className="mt-6 p-4 bg-white/60 rounded-lg border border-black/5 backdrop-blur-sm">
                       <p className="text-lg font-bold text-slate-800 leading-snug">"{result.one_sentence_warning}"</p>
                    </div>
                  </div>

                  {/* Quick Action Bar in Card */}
                  <div className="bg-white px-6 py-3 border-t border-slate-100 flex gap-3">
                     <button 
                       onClick={() => playVoiceWarning()}
                       className="cursor-pointer text-xs font-bold text-slate-600 flex items-center gap-2 hover:text-indigo-600 transition"
                     >
                       <Mic className="w-3.5 h-3.5" /> Replay Voice
                     </button>
                  </div>
                </div>

                {/* 2. DETAILED BREAKDOWN */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* RED FLAGS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Detected Threats
                     </h4>
                     <div className="space-y-2">
                        {result.red_flags?.length ? (
                          result.red_flags.map((flag, i) => (
                            <div key={i} className="text-xs p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700">
                               <strong className="block text-slate-900 mb-0.5">{flag.type.replace('_', ' ')}</strong>
                               {flag.evidence}
                            </div>
                          ))
                        ) : <span className="text-xs text-slate-400 italic">None detected.</span>}
                     </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                     <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Action Plan
                     </h4>
                     <ul className="space-y-3">
                        {result.safe_actions?.map((action, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-700">
                             <span className="flex-none w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                             <span className="leading-snug">{action}</span>
                          </li>
                        ))}
                     </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
          
          {/* BOTTOM STATUS BAR (Inside Right Col or Global Footer) */}
          <div className="border-t border-slate-100 bg-slate-50 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-500">
                 <div className="flex items-center gap-1.5">
                   <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
                   <span className="font-semibold text-slate-600">Global Radar</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Zap className="w-3.5 h-3.5 text-amber-500" />
                   <span>{reportCount.toLocaleString()} threats blocked</span>
                 </div>
              </div>
              <button className="cursor-pointer font-bold text-indigo-600 hover:underline flex items-center gap-1">
                 <BarChart3 className="w-3.5 h-3.5" /> View Trends
              </button>
          </div>
        </div>

      </div>

      {/* --- HIDDEN GENERATOR CARD --- */}
      {result && (
        <div className="fixed -left-[9999px]">
          <div 
            ref={cardRef} 
            style={{
              width: '450px',
              backgroundColor: '#0f172a', 
              color: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              fontFamily: 'sans-serif',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #1e293b', 
              backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)' 
            }}
          >
            
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: result.risk_level === 'RED' ? '#7f1d1d' : result.risk_level === 'YELLOW' ? '#78350f' : '#064e3b',
              opacity: 0.5,
              filter: 'blur(40px)',
              zIndex: 0
            }}></div>

            {/* HEADER: Logo & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, marginBottom: '24px' }}>
              {/* Logo Image */}
              <img 
                src="/aegis-share_logo_white_transparent.png" 
                alt="Aegis Logo" 
                style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
                onLoad={() => console.log("Logo loaded for card")}
              />
              
              {/* Risk Badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px 16px', borderRadius: '999px',
                fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em',
                backgroundColor: result.risk_level === 'RED' ? '#dc2626' : result.risk_level === 'YELLOW' ? '#fbbf24' : '#059669',
                color: result.risk_level === 'YELLOW' ? '#0f172a' : '#ffffff',
                minWidth: '100px', textAlign: 'center'
              }}>
                {result.risk_level} RISK
              </div>
            </div>

            {/* MAIN WARNING */}
            <div style={{ position: 'relative', zIndex: 10, marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.3', margin: 0, color: '#ffffff' }}>
                {result.one_sentence_warning}
              </h3>
            </div>

            {/* ACTION PLAN BOX */}
            <div style={{
              backgroundColor: 'rgba(30, 41, 59, 0.5)', 
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(71, 85, 105, 0.5)', 
              position: 'relative',
              zIndex: 10
            }}>
              <h4 style={{ 
                fontSize: '11px', 
                fontWeight: 'bold', 
                color: '#94a3b8', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                marginBottom: '16px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                RECOMMENDED ACTIONS
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {result.safe_actions?.map((action, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', fontWeight: '500', marginBottom: '12px', lineHeight: '1.4', color: '#f1f5f9' }}>
                    <span style={{ 
                      color: result.risk_level === 'RED' ? '#ef4444' : result.risk_level === 'YELLOW' ? '#f59e0b' : '#10b981',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>➜</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FOOTER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: '24px', position: 'relative', zIndex: 10, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', transform: 'translateY(1px)' }}>
                  <circle cx="12" cy="12" r="10" fill="#3b82f6" />
                  <path d="M7.5 12L10.5 15L16.5 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ lineHeight: '1' }}>Verified by Aegis Share</span>
              </span>
              <span style={{ lineHeight: '1' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

          </div>
        </div>
      )}

      {/* CSS Globals */}
      <style jsx global>{`
        /* ANIMATIONS */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* CLASSES */
        .animate-slideDown { animation: slideDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes music-bar { 0%, 100% { height: 20%; } 50% { height: 80%; } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}</style>
    </main>
  );
}
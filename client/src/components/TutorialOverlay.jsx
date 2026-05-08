import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { playSound } from '../utils/audio';

const STEPS = [
  {
    id: "WELCOME",
    title: "BIO_SYSTEM_BOOT",
    text: "Uplink established. You are now part of the CSSNAP Bio-Grid. I will guide your neural integration into the precision dueling protocols.",
    highlightId: null
  },
  {
    id: "TARGET",
    title: "GLOBAL_MISSION_LINK",
    text: "Observe the Global_Mission. This is your target design. Every pixel and color value must be replicated with absolute fidelity.",
    highlightId: "target-design"
  },
  {
    id: "EDITOR",
    title: "LOCAL_BUFFER_ENTRY",
    text: "This is your Neural Compiler. Inject CSS properties here. Type 'background: #10b981;' to begin the synchronization.",
    highlightId: "editor",
    require: (score, css) => score > 0 || (css || "").length > 10
  },
  {
    id: "PREVIEW",
    title: "BUFFER_VISUALIZATION",
    text: "Your Local_Buffer shows your progress in real-time. Watch it closely as you cultivate your design.",
    highlightId: "local-preview"
  },
  {
    id: "SCORING",
    title: "PRECISION_TELEMETRY",
    text: "Monitor your Bio_Telemetry. We require at least 80% harmony to authorize full combat status. Adjust your code until the link is green.",
    highlightId: ["scoreboard", "editor", "target-design"],
    require: (score) => score >= 80
  },
  {
    id: "READY",
    title: "GRID_AUTHORIZED",
    text: "Neural calibration complete. You are now a certified Bio-Stylist. Go forth and dominate the grid.",
    highlightId: null
  }
];

function Typewriter({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      i++;
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        if (text[i - 1] !== ' ' && i % 2 === 0) playSound('typewriter');
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
}

export default function TutorialOverlay({ onComplete, currentScore, currentCSS }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [spotlightRects, setSpotlightRects] = useState([]);
  
  const currentStep = STEPS[stepIndex];

  const handleTypewriterComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  // Calculate spotlight positions
  useEffect(() => {
    const ids = Array.isArray(currentStep.highlightId) 
      ? currentStep.highlightId 
      : (currentStep.highlightId ? [currentStep.highlightId] : []);
    
    if (ids.length > 0) {
      const rects = ids.map(id => {
        const el = document.querySelector(`[data-tutorial="${id}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        }
        return null;
      }).filter(Boolean);
      
      setSpotlightRects(rects);
      
      // Scroll to primary element
      const primaryId = Array.isArray(currentStep.highlightId) ? "editor" : currentStep.highlightId;
      const primaryEl = document.querySelector(`[data-tutorial="${primaryId}"]`) || document.querySelector(`[data-tutorial="${ids[0]}"]`);
      primaryEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setSpotlightRects([]);
    }
  }, [currentStep.highlightId, stepIndex]);

  const next = () => {
    if (isTyping) return; 
    if (currentStep.require && !currentStep.require(currentScore, currentCSS)) return; 

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      setIsTyping(true);
    } else {
      onComplete();
    }
  };

  const isBlocked = !!(currentStep.require && !currentStep.require(currentScore, currentCSS));

  // Determine where to place the box - move to SIDE to avoid occlusion
  const boxPosition = useMemo(() => {
    return { top: '120px', right: '40px' }; // Top-right placement is safest
  }, []);

  // Safe clip-path string for multiple rects (using a combined bounding box for stability)
  const clipPathStyle = useMemo(() => {
    if (spotlightRects.length === 0) return 'none';
    
    const padding = 12;
    const minLeft = Math.min(...spotlightRects.map(r => r.left)) - padding;
    const minTop = Math.min(...spotlightRects.map(r => r.top)) - padding;
    const maxRight = Math.max(...spotlightRects.map(r => r.left + r.width)) + padding;
    const maxBottom = Math.max(...spotlightRects.map(r => r.top + r.height)) + padding;
    
    return `polygon(0% 0%, 0% 100%, ${minLeft}px 100%, ${minLeft}px ${minTop}px, ${maxRight}px ${minTop}px, ${maxRight}px ${maxBottom}px, ${minLeft}px ${maxBottom}px, ${minLeft}px 100%, 100% 100%, 100% 0%)`;
  }, [spotlightRects]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/85 transition-all duration-500" 
        style={{ clipPath: clipPathStyle }} 
      />
      
      {spotlightRects.length === 0 && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />}

      <div 
        className="fixed z-[101] w-full max-w-sm bg-[#0c120e] border-t-2 border-emerald-500 rounded-b-xl p-6 shadow-[0_0_100px_rgba(0,0,0,0.9)] pointer-events-auto transition-all duration-500"
        style={boxPosition}
      >
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] font-mono font-black text-emerald-500 tracking-[0.4em] uppercase">
                Guide_Unit::V4.2
              </span>
           </div>
           <div className="text-[9px] font-mono text-emerald-900 font-bold tracking-widest uppercase">
              {Math.round(((stepIndex + 1) / STEPS.length) * 100)}%
           </div>
        </div>

        <h2 className="text-xl font-black text-emerald-50 mb-2 tracking-tighter italic flex items-center gap-3">
          <span className="text-emerald-500 opacity-30 text-base font-mono">[{String(stepIndex + 1).padStart(2, '0')}]</span>
          {currentStep.title}
        </h2>
        
        <p className="text-emerald-500/80 font-mono text-xs leading-relaxed mb-8 min-h-[40px]">
          <Typewriter text={currentStep.text} onComplete={handleTypewriterComplete} />
        </p>

        <div className="flex justify-between items-center">
           <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 w-3 rounded-full transition-all duration-500 ${i === stepIndex ? 'bg-emerald-500 w-6 shadow-[0_0_10px_#10b981]' : (i < stepIndex ? 'bg-emerald-800' : 'bg-emerald-950')}`} />
              ))}
           </div>
           
           <button 
             onClick={next}
             disabled={isBlocked || isTyping}
             className={`px-6 py-2.5 rounded-sm font-black text-[9px] tracking-[0.2em] uppercase transition-all ${
               isBlocked || isTyping
               ? 'bg-emerald-950/50 text-emerald-900 cursor-not-allowed border border-emerald-900/10' 
               : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95'
             }`}
           >
             {isTyping ? "SYNC..." : (isBlocked ? "AWAIT_ACTION" : (stepIndex === STEPS.length - 1 ? "FINALIZE" : "PROCEED"))}
           </button>
        </div>

        {currentStep.require && (
            <div className={`absolute -top-8 right-0 px-3 py-1 rounded-full border text-[7px] font-black tracking-widest uppercase transition-all duration-500 ${
                !isBlocked 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-500/50'
            }`}>
                Status: {!isBlocked ? 'Ready' : 'Pending'}
            </div>
        )}
      </div>
    </div>
  );
}

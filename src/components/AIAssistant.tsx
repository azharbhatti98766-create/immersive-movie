import React, { useState, useEffect } from "react";
import { Sparkles, MessageSquare, Flame, Lightbulb, Compass, Film, X, HelpCircle, Heart, Star } from "lucide-react";
import { playClickSound } from "../utils/audioSynth";

interface AIAssistantProps {
  onQuickSelectMoods: (moods: string[]) => void;
  onQuickQuery: (query: string) => void;
  audioActive: boolean;
}

export default function AIAssistant({
  onQuickSelectMoods,
  onQuickQuery,
  audioActive,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleText, setBubbleText] = useState("Need help finding a masterpiece?");
  const [animationPhase, setAnimationPhase] = useState(0);

  // Rotating tips or suggestions spoken by CineMia
  const MIA_TIPS = [
    "Need help finding a masterpiece?",
    "Try searching for: 'astronaut on a giant water planet with giant waves'!",
    "Combine 'Sci-Fi' + 'Action' + 'Thriller' for ultimate adrenaline!",
    "Click on any movie to open its IMDb preview context instantly!",
    "Ask me for a 'space puzzle movie with heavy twists' in Movie Finder!",
    "We use real-time Google Gemini to build customized 3D movie vibes!",
    "Enjoy the synthesized synth music inside CineVibe!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((p) => (p + 1) % MIA_TIPS.length);
      setBubbleText(MIA_TIPS[(animationPhase + 1) % MIA_TIPS.length]);
    }, 9000);
    return () => clearInterval(interval);
  }, [animationPhase]);

  const handleMiaClick = () => {
    setIsOpen(!isOpen);
    if (audioActive) {
      playClickSound("soft_bubble_pop");
    }
  };

  const handleShortcut = (type: "cyber" | "horror" | "comedy" | "mindbend") => {
    if (audioActive) {
      playClickSound("vintage_click");
    }
    if (type === "cyber") {
      onQuickSelectMoods(["sci-fi", "action"]);
      setBubbleText("Excellent! Loading the neon digital hyper-future vibe!");
    } else if (type === "horror") {
      onQuickSelectMoods(["horror", "thriller"]);
      setBubbleText("Oh! The dark corridor whispers await us...");
    } else if (type === "comedy") {
      onQuickSelectMoods(["funny", "romance"]);
      setBubbleText("Splendid choice! Let's brighten up the atmosphere!");
    } else if (type === "mindbend") {
      onQuickQuery("detective trapped in an layered simulation with temporal loop");
      setBubbleText("Mind-bending detective loop query loaded for matching!");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* CineMia Panel */}
      {isOpen && (
        <div className="mb-4 w-80 bg-zinc-950/90 border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl pointer-events-auto animate-fade-in relative">
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-zinc-950 border-r border-b border-indigo-500/30 rotate-45 transform" />
          
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-1">
                CineMia <span className="text-[9px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded-full">Assistant</span>
              </h4>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed italic mb-3">
            "{bubbleText}"
          </p>

          <div className="space-y-2.5">
            <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 uppercase block">
              💡 MIA'S INSTANT CHEATS / SHORTCUTS
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleShortcut("cyber")}
                className="p-2 text-left bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 text-[10px] font-mono text-indigo-300 transition-all flex flex-col items-start gap-0.5"
              >
                <span className="font-bold flex items-center gap-1">⚡ Cyberpunk Duo</span>
                <span className="text-[9px] text-zinc-400">Match Action + Sci-Fi</span>
              </button>

              <button
                type="button"
                onClick={() => handleShortcut("horror")}
                className="p-2 text-left bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 text-[10px] font-mono text-rose-300 transition-all flex flex-col items-start gap-0.5"
              >
                <span className="font-bold flex items-center gap-1">💀 Creepy Corridor</span>
                <span className="text-[9px] text-zinc-400">Horror + Thriller combo</span>
              </button>

              <button
                type="button"
                onClick={() => handleShortcut("comedy")}
                className="p-2 text-left bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 text-[10px] font-mono text-amber-300 transition-all flex flex-col items-start gap-0.5"
              >
                <span className="font-bold flex items-center gap-1">🌟 Light & Cozy</span>
                <span className="text-[9px] text-zinc-400">Laughter + Romance mix</span>
              </button>

              <button
                type="button"
                onClick={() => handleShortcut("mindbend")}
                className="p-2 text-left bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 text-[10px] font-mono text-cyan-300 transition-all flex flex-col items-start gap-0.5"
              >
                <span className="font-bold flex items-center gap-1">🌀 Temporal Loop</span>
                <span className="text-[9px] text-zinc-400">Auto-fill custom search</span>
              </button>
            </div>

            <div className="text-[9px] text-zinc-500 leading-normal font-sans border-t border-white/5 pt-2 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Tip: You can select multiple genres in the Mood Matcher!</span>
            </div>
          </div>
        </div>
      )}

      {/* CineMia Avatar and Small speech bubble */}
      <div className="flex items-center gap-2 pointer-events-auto">
        
        {/* Horizontal Mini Speech bubble */}
        {!isOpen && (
          <div className="bg-zinc-950/80 border border-indigo-500/20 text-[10px] font-mono text-zinc-300 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md max-w-[180px] truncate animate-bounce">
            Need help?
          </div>
        )}

        {/* 3D Rendered CSS Art Assistant Girl (CineMia) */}
        <button
          onClick={handleMiaClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-16 h-16 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 group flex items-center justify-center"
          title="Click to interact with Assistant CineMia!"
        >
          {/* Outer glowing halo ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 opacity-40 blur-md group-hover:opacity-150 transition-opacity duration-300 animate-spin-slow" />
          
          <div className="absolute inset-0.5 rounded-full bg-zinc-950 border border-white/20 flex items-center justify-center overflow-hidden">
            {/* 3D anime-inspired assistant face rendering using premium layered vectors */}
            <div className={`relative w-12 h-12 flex items-center justify-center transition-transform duration-500 ${isHovered ? "scale-110" : "animate-floating"}`}>
              
              {/* Anime Hair - Back layer */}
              <div className="absolute top-1.5 w-9 h-9 bg-zinc-800 rounded-full" />
              
              {/* Cute Neck & Outfit */}
              <div className="absolute bottom-0 w-5 h-4 bg-indigo-600 rounded-b-md border-t border-cyan-400" />
              
              {/* Anime Hair side bangs */}
              <div className="absolute top-2 left-1.5 w-2 h-7 bg-zinc-800 rounded-br-lg" />
              <div className="absolute top-2 right-1.5 w-2 h-7 bg-zinc-800 rounded-bl-lg" />

              {/* Face Sphere */}
              <div className="absolute top-2 w-8 h-8 bg-[#ffeedd] rounded-full flex flex-col justify-center items-center shadow-inner">
                
                {/* Cheeks blush */}
                <div className="absolute bottom-1.5 left-1 w-1.5 h-1 bg-pink-400/60 rounded-full blur-[0.5px]" />
                <div className="absolute bottom-1.5 right-1 w-1.5 h-1 bg-pink-400/60 rounded-full blur-[0.5px]" />

                {/* Glasses / Round Spectacles */}
                <div className="absolute top-2.5 inset-x-0.5 flex justify-between px-1 z-10 pointer-events-none">
                  {/* Left lens */}
                  <div className="w-3.5 h-3.5 rounded-full border border-black/80 bg-cyan-200/20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-2 opacity-85" />
                  </div>
                  {/* Bridge */}
                  <div className="w-1 h-0.5 bg-black/80 mt-1.5" />
                  {/* Right lens */}
                  <div className="w-3.5 h-3.5 rounded-full border border-black/80 bg-cyan-200/20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full absolute top-1 right-2 opacity-85" />
                  </div>
                </div>

                {/* Soft expressive eyes (behind glasses) */}
                <div className="flex gap-3 justify-center items-center mt-1">
                  {/* Left eye */}
                  <div className="w-2 h-2 bg-zinc-900 rounded-full flex items-center justify-center relative">
                    <div className="w-[3px] h-[3px] bg-white rounded-full absolute top-0 right-0" />
                    {isHovered && <Star className="w-1.5 h-1.5 text-yellow-300 absolute" />}
                  </div>
                  {/* Right eye */}
                  <div className="w-2 h-2 bg-zinc-900 rounded-full flex items-center justify-center relative">
                    <div className="w-[3px] h-[3px] bg-white rounded-full absolute top-0 left-0" />
                    {isHovered && <Star className="w-1.5 h-1.5 text-yellow-300 absolute" />}
                  </div>
                </div>

                {/* Expressive Mouth */}
                <div className={`mt-2.5 w-1.5 h-0.5 bg-rose-500 rounded-full transition-all duration-300 ${isHovered ? "h-1.5 w-2" : "h-1"}`} />
              </div>

              {/* Anime Hair Bangs - Front layer */}
              <div className="absolute top-1 w-8 h-2.5 bg-zinc-800 rounded-b-md" />
              {/* Cute Hair bow */}
              <div className="absolute top-0.5 left-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-sm" />
              <div className="absolute top-0.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-sm" />

            </div>
          </div>
        </button>
      </div>

    </div>
  );
}

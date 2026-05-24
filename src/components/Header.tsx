import { useState, useEffect } from "react";
import { Film, Volume2, VolumeX, Sparkles, Clock, Compass } from "lucide-react";

interface HeaderProps {
  currentEnvironment: string;
  colors: string[];
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onReset: () => void;
}

export default function Header({
  currentEnvironment,
  colors,
  audioEnabled,
  onToggleAudio,
  onReset,
}: HeaderProps) {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    // Maintain highly polished real-time clock indicator in margins or panel
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.getUTCFullYear() + "-" + 
                 String(now.getUTCMonth() + 1).padStart(2, '0') + "-" + 
                 String(now.getUTCDate()).padStart(2, '0') + " " + 
                 String(now.getUTCHours()).padStart(2, '0') + ":" + 
                 String(now.getUTCMinutes()).padStart(2, '0') + ":" + 
                 String(now.getUTCSeconds()).padStart(2, '0'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format environment identifier visually
  const formattedEnv = currentEnvironment
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 transition-all duration-700">
      <div 
        id="app_header_logo"
        onClick={onReset} 
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 shadow-lg shadow-rose-500/10 group-hover:scale-105 transition-transform duration-300">
          <Film className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
            Immersive Movie Finder <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono font-medium">3D INTERACTIVE</span>
          </h1>
          <p className="text-xs text-white/50 tracking-wider uppercase font-mono mt-0.5">
            Gemini Semantic Curation Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto sm:ml-0">
        {/* Real-time UTC Metrics badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-black/30 font-mono text-xs text-white/60">
          <Clock className="w-3.5 h-3.5" />
          <span>{utcTime} UTC</span>
        </div>

        {/* Audio feedback Synthesizer control */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono border transition-all duration-300 ${
            audioEnabled
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10 hover:bg-emerald-500/30 font-semibold"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
          }`}
          title={audioEnabled ? "Press to mute immersive background synth" : "Press to enable immersive ambient soundtrack synthesis"}
        >
          {audioEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>SYNTH ACTIVE</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span>MUTED</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

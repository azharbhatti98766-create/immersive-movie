import { Sparkles, Laugh, HeartCrack, Swords, Flame, Skull, Ghost, Heart, Check } from "lucide-react";
import { RegionType, MoodType, PresetMood, PresetRegion } from "../types";

interface MoodMatcherProps {
  selectedRegion: RegionType;
  onSelectRegion: (region: RegionType) => void;
  selectedMoods: MoodType[];
  onToggleMood: (mood: MoodType) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const REGIONS: PresetRegion[] = [
  { id: "Hollywood", label: "Hollywood", flag: "🇺🇸" },
  { id: "Bollywood", label: "Bollywood", flag: "🇮🇳" },
  { id: "Korean", label: "Korean", flag: "🇰🇷" },
  { id: "Chinese", label: "Chinese", flag: "🇨🇳" },
  { id: "Japanese", label: "Japanese", flag: "🇯🇵" },
];

const MOODS: PresetMood[] = [
  { id: "funny", label: "Funny / Comedy", icon: "Laugh", color: "from-amber-400 to-orange-500" },
  { id: "sad", label: "Sad / Drama", icon: "HeartCrack", color: "from-indigo-400 to-blue-600" },
  { id: "action", label: "Action Blockbuster", icon: "Swords", color: "from-rose-500 to-red-600" },
  { id: "thriller", label: "Suspense / Thriller", icon: "Flame", color: "from-violet-500 to-purple-600" },
  { id: "sci-fi", label: "Sci-Fi / Galaxy", icon: "Sparkles", color: "from-cyan-400 to-blue-500" },
  { id: "horror", label: "Dark Horror", icon: "Ghost", color: "from-red-800 to-zinc-900" },
  { id: "romance", label: "Romantic Story", icon: "Heart", color: "from-pink-400 to-rose-500" },
];

export default function MoodMatcherTab({
  selectedRegion,
  onSelectRegion,
  selectedMoods,
  onToggleMood,
  onSubmit,
  isLoading,
}: MoodMatcherProps) {
  
  // Dynamic icon renderer helper
  const renderMoodIcon = (iconName: string) => {
    switch (iconName) {
      case "Laugh": return <Laugh className="w-5 h-5" />;
      case "HeartCrack": return <HeartCrack className="w-5 h-5" />;
      case "Swords": return <Swords className="w-5 h-5" />;
      case "Flame": return <Flame className="w-5 h-5" />;
      case "Ghost": return <Ghost className="w-5 h-5" />;
      case "Sparkles": return <Sparkles className="w-5 h-5" />;
      case "Heart": return <Heart className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div id="mood_matcher_container" className="space-y-8 animate-fade-in text-left">
      
      {/* Step 1: Region Selection */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            01. Choose Cinematic Region
          </label>
          <p className="text-xs text-zinc-500 mt-1 font-sans">
            Filter curated motion picture outputs from global cinema cultures
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {REGIONS.map((region) => {
            const isSelected = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onSelectRegion(region.id)}
                className={`py-4 px-3 rounded-xl border text-center relative overflow-hidden transition-all duration-300 active:scale-95 group ${
                  isSelected
                    ? "bg-indigo-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
                    : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900/80 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {/* Accent glow on selection */}
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-500" />
                )}
                
                <span className="text-2xl block mb-1.5 transition-transform group-hover:scale-110 duration-300">
                  {region.flag}
                </span>
                <span className="text-sm font-semibold tracking-wide font-sans block">
                  {region.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Mood Selection -- MULTI SELECT */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <label className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              02. Select Genres or Emotional Moods (Select Multiple)
            </label>
            <p className="text-xs text-zinc-500 mt-1 font-sans">
              Choose one or more vibes to cross-reference and unlock hybrid storytelling!
            </p>
          </div>
          <span className="text-[10px] sm:self-end font-semibold font-mono text-zinc-400 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
            {selectedMoods.length} Selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {MOODS.map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => onToggleMood(mood.id)}
                className={`rounded-full border text-center relative flex flex-col items-center justify-center p-3 aspect-square transition-all duration-300 active:scale-95 group overflow-hidden ${
                  isSelected
                    ? "bg-white/10 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] ring-1 ring-white/10"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900/80 hover:border-zinc-700 hover:text-zinc-200 hover:rotate-6"
                }`}
              >
                {/* Active gradient background layer */}
                <div 
                  className={`absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-300 bg-gradient-to-br ${mood.color}`} 
                />
                
                {/* Hologram glowing rings */}
                {isSelected && (
                  <div className="absolute inset-0 border border-indigo-500/30 rounded-full animate-ping-slow pointer-events-none" />
                )}

                {/* Check badge */}
                {isSelected && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 p-0.5 bg-indigo-600 rounded-full border border-white/20 flex items-center justify-center animate-bounce z-10 scale-90">
                    <Check className="w-2 h-2 text-white stroke-[3px]" />
                  </div>
                )}
                
                {/* Dynamic colored orb representing mood */}
                <div 
                  className={`p-2 rounded-full border mb-1 transition-all duration-300 ${
                    isSelected
                      ? "text-white bg-white/15 border-white/30 scale-105"
                      : "text-zinc-500 bg-zinc-950/40 border-zinc-800 group-hover:text-zinc-300 group-hover:scale-110"
                  }`}
                >
                  {renderMoodIcon(mood.icon)}
                </div>

                <span className="text-[10px] sm:text-xs font-bold tracking-tight text-center font-mono max-w-[85px] truncate">
                  {mood.label.split(" / ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action triggers */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={isLoading || selectedMoods.length === 0}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold font-mono text-sm tracking-wide shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>CONSULTING KNOWLEDGE ORBS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>MATCH CURATED RECOMMENDATIONS</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

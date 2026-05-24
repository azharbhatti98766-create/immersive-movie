import { Search, Sparkles, HelpCircle, Flame } from "lucide-react";

interface MovieFinderProps {
  queryText: string;
  onQueryChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SAMPLE_CASEFILES = [
  {
    title: "Zombie Train Horror",
    prompt: "A Korean movie where passengers are trapped on an express train during a sudden zombie virus outbreak.",
    badge: "Korean"
  },
  {
    title: "Time Loop Mecha Sci-Fi",
    prompt: "An actor is stuck in a war zone repeating the same day and dying over and over again while fighting aliens in heavy suits.",
    badge: "Hollywood"
  },
  {
    title: "Engineering Companions",
    prompt: "A Bollywood comedy-drama about three college friends overcoming extreme study pressure and a strict principal.",
    badge: "Bollywood"
  },
  {
    title: "Space Wormhole Bookshelf",
    prompt: "Astronaut travel through a wormhole to find a new home. He communicates with his daughter through gravity behind her bedroom bookshelf.",
    badge: "Hollywood"
  }
];

export default function MovieFinderTab({
  queryText,
  onQueryChange,
  onSubmit,
  isLoading,
}: MovieFinderProps) {
  
  return (
    <div id="movie_finder_container" className="space-y-6 animate-fade-in text-left">
      
      {/* Search Input Box */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Vague Case File Description
          </label>
          <p className="text-xs text-zinc-500 mt-1 font-sans">
            Describe anything you recall: snippets of scenes, actor faces, character traits, odd plots, quotes, or environments.
          </p>
        </div>

        <div className="relative">
          <textarea
            value={queryText}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type your fuzzy memories here (e.g., 'A Korean movie about a father and daughter trapped on a speeding train with zombies clawing at the doors...')"
            className="w-full min-h-[140px] p-5 rounded-xl border border-zinc-800 bg-zinc-950/70 text-sm text-zinc-150 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 placeholder-zinc-600 outline-none transition-all resize-none font-sans leading-relaxed"
          />
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-600 select-none">
            {queryText.length} characters
          </div>
        </div>
      </div>

      {/* Preset Casefiles */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          Scan Preset Casefiles (Tap to Load Memory)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_CASEFILES.map((casefile, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQueryChange(casefile.prompt)}
              className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/40 text-left hover:border-zinc-800 group transition-all duration-300 active:scale-98"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-zinc-350 tracking-wide font-sans group-hover:text-white transition-colors">
                  {casefile.title}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-950 font-medium text-zinc-500">
                  {casefile.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-sans group-hover:text-zinc-400 transition-colors">
                "{casefile.prompt}"
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Trigger */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={isLoading || !queryText.trim()}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold font-mono text-sm tracking-wide shadow-lg shadow-rose-600/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>SCANNING FILM REGISTERS...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-rose-300" />
              <span>DETECT EXACT MOVIE FIT</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}

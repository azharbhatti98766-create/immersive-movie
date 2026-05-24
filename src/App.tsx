import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Compass, Search, AlertTriangle, Play, HelpCircle, Film, Check, ExternalLink, 
  Trash2, Heart, Star, Layout, RefreshCw, Layers, ShieldCheck, Bookmark, ArrowRight, PlayCircle
} from "lucide-react";
import Header from "./components/Header";
import CinemaStage from "./components/CinemaStage";
import MoodMatcherTab from "./components/MoodMatcherTab";
import MovieFinderTab from "./components/MovieFinderTab";
import AIAssistant from "./components/AIAssistant";
import { QueryResponse, RegionType, MoodType, Movie } from "./types";
import { 
  startAmbientLoop, stopAmbientLoop, playClickSound, playHoverSound, playBingoSound, playMatchSearchTriggerSound,
  startMovieSpecificBGM, getSoundtrackSignature
} from "./utils/audioSynth";

// Trending movie cards floating in 3D space for the hero section
const TRENDING_3D_POSTERS = [
  {
    title: "Dune: Part Two",
    year: 2024,
    genre: "Sci-Fi / Epic Adventure",
    imdb_rating: "8.6/10",
    image_url: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=1200",
    description: "The visual masterpiece of galactic destiny and brutal desert conflicts.",
    region: "Hollywood",
    confidence_score: 98,
    match_reason: "A cinematic space-faring wonder designed for massive acoustic and visual scale.",
    imdb_url: "https://www.imdb.com/title/tt15239678/"
  },
  {
    title: "Blade Runner 2049",
    year: 2017,
    genre: "Sci-Fi / Cyberpunk",
    imdb_rating: "8.0/10",
    image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200",
    description: "Deep neon synthesisers, rainy streets, and philosophical replicant mysteries.",
    region: "Hollywood",
    confidence_score: 95,
    match_reason: "Fits your electronic subharmonic synth ambience expectation perfectly.",
    imdb_url: "https://www.imdb.com/title/tt1856101/"
  },
  {
    title: "Parasite",
    year: 2019,
    genre: "Drama / Suspense Thriller",
    imdb_rating: "8.5/10",
    image_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
    description: "A dark satire on societal hierarchy structure inside modern architecture.",
    region: "Korean",
    confidence_score: 96,
    match_reason: "Intricate narrative twists and suspense-ridden plot points.",
    imdb_url: "https://www.imdb.com/title/tt6751668/"
  }
];

export default function App() {
  // Navigation & User Input state
  const [activeTab, setActiveTab] = useState<"mood_matcher" | "movie_finder">("mood_matcher");
  const [selectedRegion, setSelectedRegion] = useState<RegionType>("Hollywood");
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>(["action"]);
  const [queryText, setQueryText] = useState("");

  // Storage states
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("immersive_watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // History and randomization exclusions state
  const [seenTitles, setSeenTitles] = useState<string[]>([]);

  // Server state
  const [isLoading, setIsLoading] = useState(false);
  const [movieResult, setMovieResult] = useState<QueryResponse | null>(null);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio configuration
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Extract variables for background styling derived from the AI-generated ui_metadata
  const currentEnv = movieResult?.ui_metadata?.environment_3d || "cozy_vintage_theater";
  const colors = movieResult?.ui_metadata?.color_palette || ["#0b0f19", "#e0a96d", "#1f2937"];
  const resultAmbience = movieResult?.ui_metadata?.interaction_sounds?.ambience || "";

  // Dynamic ambient audio synthesis loop watcher
  useEffect(() => {
    if (audioEnabled) {
      const activeMovie = movieResult?.movies?.[currentMovieIndex];
      if (activeMovie) {
        startMovieSpecificBGM(activeMovie.title, activeMovie.genre);
      } else {
        const targetAmbience = resultAmbience || "cozy_vintage_hum";
        startAmbientLoop(targetAmbience);
      }
    } else {
      stopAmbientLoop();
    }
    return () => {
      stopAmbientLoop();
    };
  }, [audioEnabled, movieResult, currentMovieIndex, resultAmbience]);

  // Sync watchlist to local storage
  useEffect(() => {
    localStorage.setItem("immersive_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const handleToggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    if (nextState) {
      playClickSound("soft_bubble_pop");
    }
  };

  const handleToggleMood = (mood: MoodType) => {
    setSelectedMoods((prev) => {
      let next: MoodType[];
      if (prev.includes(mood)) {
        if (prev.length <= 1) return prev; // Keep at least one mood checked
        next = prev.filter((m) => m !== mood);
      } else {
        next = [...prev, mood];
      }
      if (audioEnabled) {
        playClickSound("soft_bubble_pop");
      }
      return next;
    });
  };

  const resetMatcher = () => {
    setMovieResult(null);
    setCurrentMovieIndex(0);
    setErrorMessage(null);
    setQueryText("");
    if (audioEnabled) {
      playClickSound("vintage_click");
    }
  };

  const handleQuerySubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setMovieResult(null);
    setCurrentMovieIndex(0);

    // Audio cue
    if (audioEnabled) {
      playMatchSearchTriggerSound();
    }

    try {
      const payload = 
        activeTab === "mood_matcher"
          ? { task: "mood_matcher", region: selectedRegion, mood: selectedMoods, exclude: seenTitles }
          : { task: "movie_finder", query: queryText, exclude: seenTitles };

      const res = await fetch("/api/movie-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || `Server responded with error status ${res.status}`);
      }

      const data: QueryResponse = await res.json();
      setMovieResult(data);
      
      // Auto-jump to recommendations section after getting content
      setTimeout(() => {
        const stageEl = document.getElementById("ai_recommendations_sec");
        if (stageEl) {
          stageEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);

      // Accumulate suggested titles so they can be filtered on subsequent queries
      if (data.movies && data.movies.length > 0) {
        const newlyReturned = data.movies.map((m) => m.title);
        setSeenTitles((prev) => {
          const combined = [...prev, ...newlyReturned];
          if (combined.length > 40) {
            return combined.slice(combined.length - 40);
          }
          return combined;
        });
      }

      // Celebratory triggersound on find!
      if (audioEnabled) {
        setTimeout(() => {
          playBingoSound();
        }, 80);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "We couldn't connect to the film records database. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Direct manual load of preset blockbusters or trending movies
  const handleLoadDirectMovie = (directMovie: typeof TRENDING_3D_POSTERS[0]) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    if (audioEnabled) {
      playMatchSearchTriggerSound();
    }

    setTimeout(() => {
      // Pack into standard QueryResponse mock
      const mockResult: QueryResponse = {
        action_type: "movie_finder",
        movies: [{
          title: directMovie.title,
          year: directMovie.year,
          region: directMovie.region,
          genre: directMovie.genre,
          synopsis: directMovie.description,
          match_reason: directMovie.match_reason,
          confidence_score: directMovie.confidence_score,
          imdb_rating: directMovie.imdb_rating,
          imdb_url: directMovie.imdb_url,
          image_url: directMovie.image_url
        }],
        ui_metadata: {
          environment_3d: "epic_space_galaxy",
          color_palette: ["#4c1d95", "#06b6d4", "#db2777"],
          interaction_sounds: {
            click_sound: "sci_fi_click",
            hover_sound: "lightsaber_hum",
            ambience: "space_drones"
          }
        }
      };

      setMovieResult(mockResult);
      setCurrentMovieIndex(0);
      setIsLoading(false);
      
      if (audioEnabled) {
        playBingoSound();
      }

      // Smooth scroll
      setTimeout(() => {
        const stageEl = document.getElementById("ai_recommendations_sec");
        if (stageEl) {
          stageEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    }, 600);
  };

  const handleNextMovie = () => {
    if (movieResult && movieResult.movies.length > 1) {
      if (audioEnabled) playClickSound(movieResult.ui_metadata.interaction_sounds.click_sound);
      setCurrentMovieIndex((prev) => (prev + 1) % movieResult.movies.length);
    }
  };

  const handlePrevMovie = () => {
    if (movieResult && movieResult.movies.length > 1) {
      if (audioEnabled) playClickSound(movieResult.ui_metadata.interaction_sounds.click_sound);
      setCurrentMovieIndex((prev) => (prev - 1 + movieResult.movies.length) % movieResult.movies.length);
    }
  };

  const handleAddToWatchlist = (movie: Movie) => {
    if (watchlist.some((m) => m.title.toLowerCase() === movie.title.toLowerCase())) {
      return; // Already added
    }
    setWatchlist((prev) => [...prev, movie]);
    if (audioEnabled) {
      playClickSound("soft_bubble_pop");
    }
  };

  const handleRemoveFromWatchlist = (movieTitle: string) => {
    setWatchlist((prev) => prev.filter((m) => m.title !== movieTitle));
    if (audioEnabled) {
      playClickSound("soft_bubble_pop");
    }
  };

  const triggerTapSound = () => {
    if (audioEnabled) {
      playClickSound("soft_bubble_pop");
    }
  };

  // Background overlay styles dependent on Gemini configurations
  const dynamicBackgroundStyle = movieResult 
    ? {
        background: `radial-gradient(circle at 50% 50%, ${colors[0]}55 0%, #030712 100%)`,
      }
    : {
        background: "radial-gradient(circle at 50% 50%, #090615 0%, #020205 100%)",
      };

  return (
    <div 
      className="min-h-screen bg-zinc-950 text-white flex flex-col transition-all duration-1000 ease-in-out font-sans relative"
      style={dynamicBackgroundStyle}
    >
      {/* Cinematic Live Wallpaper Background Video */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_102933_4e8f73b5-775a-4179-b2fb-472f59063dcd.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-[0.25] transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-zinc-950/40 mix-blend-multiply" />
      </div>

      {/* Absolute floating luxury ambient circles (simulating 3D volumetric light) */}
      <div className="absolute top-20 right-[10%] w-[33vw] h-[33vw] rounded-full bg-indigo-900/10 blur-[130px] pointer-events-none select-none z-0 animate-pulse" />
      <div className="absolute bottom-40 left-[5%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/10 blur-[160px] pointer-events-none select-none z-0" />
      <div className="absolute top-[40%] left-[45%] w-[25vw] h-[25vw] rounded-full bg-pink-900/5 blur-[120px] pointer-events-none select-none z-0" />

      {/* Galaxy grid elements */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 z-0 pointer-events-none" />

      <Header
        currentEnvironment={currentEnv}
        colors={colors}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onReset={resetMatcher}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 z-10 space-y-24">
        
        {/* SECTION 1: FULLSCREEN HERO SECTION */}
        <section id="hero_section" className="min-h-[80vh] flex flex-col justify-center items-center text-center py-6 relative">
          
          {/* Headline and Badges */}
          <div className="space-y-6 max-w-4xl mx-auto z-10 animate-fade-in px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-indigo-500/20 text-indigo-400 text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              <span>Next-Gen Cinematic Matcher</span>
            </div>
            
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-tight uppercase font-sans">
              <span className="bg-gradient-to-r from-white via-zinc-100 to-indigo-200 bg-clip-text text-transparent">Immersive</span>{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">Movie Finder</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-sans">
              Weave emotional vibes and hybrid genres together or query fuzzy memory story clues. Speak to our interactive 3D virtual assistant or scroll to match masterpiece cinema directly!
            </p>
          </div>

          {/* Quick Search bar inside Hero section */}
          <div className="w-full max-w-2xl mt-10 px-4 z-10">
            <div className="grid grid-cols-1 p-1 bg-zinc-900/70 border border-white/10 rounded-2xl shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 backdrop-blur-md transition-all duration-300">
              <div className="flex items-center gap-2 px-3">
                <Search className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && queryText.trim()) {
                      setActiveTab("movie_finder");
                      handleQuerySubmit();
                    }
                  }}
                  placeholder="Quick fuzzy search (e.g., 'mysterious island with shifting timelines')..."
                  className="w-full bg-transparent py-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
                />
                <button
                  onClick={() => {
                    if (queryText.trim()) {
                      setActiveTab("movie_finder");
                      handleQuerySubmit();
                    }
                  }}
                  disabled={!queryText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all shrink-0 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  MATCH
                </button>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-2 uppercase tracking-wide">
              Press Enter or click Match to activate Gemini 3D adaptive generation
            </p>
          </div>

          {/* 3D Trending Movie Cards floating in space */}
          <div className="mt-16 w-full max-w-5xl px-4 z-10">
            <div className="text-left mb-6 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Trending Masterpieces Floating in Depth
              </span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase">click on any card to project into adaptive 3D space</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TRENDING_3D_POSTERS.map((trending, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadDirectMovie(trending)}
                  className="bg-zinc-950/60 border border-white/5 hover:border-indigo-500/30 p-4 rounded-2xl text-left cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/5 group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                >
                  {/* Backdrop wallpaper thumbnail in card body */}
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-center bg-cover pointer-events-none" style={{ backgroundImage: `url(${trending.image_url})` }} />
                  {/* Subtle top highlights */}
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/10">
                        {trending.genre.split(" / ")[0]}
                      </span>
                      <span className="text-[10px] font-mono text-yellow-400 font-bold">★ {trending.imdb_rating}</span>
                    </div>
                    <h4 className="text-lg font-bold font-sans tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                      {trending.title}
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                      {trending.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-3 relative z-10">
                    <span>{trending.region} ({trending.year})</span>
                    <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Load Vibe &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: GENRE EXPLORER (Circular holographic buttons, hover rotation) */}
        <section id="genre_explorer_sec" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-black font-sans tracking-tight uppercase">
              🔮 Holographic Genre Explorer
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
              Select multiple moods and genres below to cross-pollinate. Our curation engine will discover exact hybrid movie coordinates!
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-zinc-950/40 border border-white/5 rounded-2xl shadow-xl p-6 md:p-8 backdrop-blur" id="interactive_console_panel">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 mb-6 gap-3">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    triggerTapSound();
                    setActiveTab("mood_matcher");
                  }}
                  className={`pb-4 px-1 text-sm font-semibold tracking-wide font-mono flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === "mood_matcher"
                      ? "border-indigo-500 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  MOOD MATCHER
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerTapSound();
                    setActiveTab("movie_finder");
                  }}
                  className={`pb-4 px-1 text-sm font-semibold tracking-wide font-mono flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    activeTab === "movie_finder"
                      ? "border-rose-500 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  MOVIE FINDER
                </button>
              </div>

              {seenTitles.length > 0 && (
                <div className="pb-4 sm:pb-0 flex items-center gap-2 justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    Variety: {seenTitles.length} matches hidden
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSeenTitles([]);
                      triggerTapSound();
                    }}
                    className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 font-bold hover:underline px-2 py-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Reset List
                  </button>
                </div>
              )}
            </div>

            {/* Active Sub-tab View */}
            {activeTab === "mood_matcher" ? (
              <MoodMatcherTab
                selectedRegion={selectedRegion}
                onSelectRegion={(reg) => {
                  triggerTapSound();
                  setSelectedRegion(reg);
                }}
                selectedMoods={selectedMoods}
                onToggleMood={handleToggleMood}
                onSubmit={handleQuerySubmit}
                isLoading={isLoading}
              />
            ) : (
              <MovieFinderTab
                queryText={queryText}
                onQueryChange={setQueryText}
                onSubmit={handleQuerySubmit}
                isLoading={isLoading}
              />
            )}
          </div>
        </section>

        {/* SECTION 3 & 4: AI RECOMMENDATIONS & MOVIE DETAILS VIEW */}
        <section id="ai_recommendations_sec" className="scroll-mt-24 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[10px] font-mono bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
              Active Projection Theater
            </span>
            <h2 className="text-3xl font-black font-sans tracking-tight uppercase">
              🎬 Recommendation Details Page
            </h2>
          </div>

          {/* Dynamic Errors Container */}
          {errorMessage && (
            <div className="w-full max-w-lg mx-auto p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-3 animate-shake font-sans text-left">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <div>
                <h5 className="font-semibold text-sm">Curation Error</h5>
                <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Loading Visual Stage Screen */}
          {isLoading && (
            <div className="w-full max-w-xl bg-zinc-950/60 border border-white/10 p-12 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-5 text-center mx-auto min-h-[350px] backdrop-blur-md">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 border-r-pink-500 animate-spin" />
                <div className="absolute w-12 h-12 rounded-full border-2 border-white/10 border-b-cyan-400 animate-spin-reverse" />
                <Film className="absolute w-6 h-6 text-zinc-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-white font-sans uppercase tracking-wider">
                  Projecting Vibe Dimensions...
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm tracking-wide leading-relaxed font-mono">
                  Gemini is blending dynamic wallpapers, interactive sounds, and matching rating files for {activeTab === "mood_matcher" ? "Mood parameters" : "Memory terms"}...
                </p>
              </div>
            </div>
          )}

          {/* Content Result Rendering */}
          {!isLoading && movieResult && movieResult.movies && movieResult.movies.length > 0 ? (
            <div className="space-y-6">
              
              {/* Added to Watchlist Shortcut Quick Action */}
              <div className="max-w-4xl mx-auto flex items-center justify-between px-2">
                <p className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 uppercase">
                  <span>Recommendation {currentMovieIndex + 1} of {movieResult.movies.length}</span>
                </p>
                
                <button
                  onClick={() => handleAddToWatchlist(movieResult.movies[currentMovieIndex])}
                  disabled={watchlist.some((m) => m.title.toLowerCase() === movieResult.movies[currentMovieIndex].title.toLowerCase())}
                  className="px-4 py-1.5 text-xs font-mono font-bold bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-full cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:bg-emerald-500/10 disabled:text-emerald-300 disabled:border-emerald-500/20"
                >
                  {watchlist.some((m) => m.title.toLowerCase() === movieResult.movies[currentMovieIndex].title.toLowerCase()) ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>ON WATCHLIST</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>+ ADD TO WATCHLIST</span>
                    </>
                  )}
                </button>
              </div>

              {/* The Cinematic Screen Details Component */}
              <CinemaStage
                movie={movieResult.movies[currentMovieIndex]}
                uiMetadata={movieResult.ui_metadata}
                isLoading={isLoading}
                onExploreMore={resetMatcher}
                index={currentMovieIndex}
                total={movieResult.movies.length}
                onNext={handleNextMovie}
                onPrev={handlePrevMovie}
                audioActive={audioEnabled}
              />
            </div>
          ) : (
            null
          )}

          {/* Mock placeholder view when no result has been queried */}
          {!movieResult && !isLoading && (
            <div className="w-full max-w-4xl mx-auto bg-zinc-950/20 border border-white/5 p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4 min-h-[300px] backdrop-blur-sm">
              <div className="p-4 rounded-full bg-zinc-900 border border-white/10 text-indigo-400 mb-2">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-sm text-zinc-400 max-w-md font-sans leading-relaxed">
                Step into the holographic arena. Select moods, tweak coordinates, and let our semantic matching engine construct a bespoke Cinema Stage environment.
              </p>
              <a 
                href="#genre_explorer_sec"
                className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 tracking-wider flex items-center gap-1 uppercase hover:underline"
              >
                <span>Browse Hologram Grid</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          )}
        </section>

        {/* SECTION 5: WATCHLIST (Minimal premium dashboard feel, smooth transitions) */}
        <section id="watchlist_section" className="scroll-mt-24 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-2xl font-black font-sans uppercase flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-indigo-400" />
                Your Watchlist Chamber
              </h3>
              <p className="text-xs text-zinc-500 font-normal mt-1">
                Movies locked onto your local premium queue for future cinematic projections.
              </p>
            </div>
            <span className="text-xs font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-full text-zinc-400 font-bold">
              {watchlist.length} Saved
            </span>
          </div>

          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {watchlist.map((movie, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/40 border border-white/5 hover:border-indigo-500/20 rounded-xl p-4 flex flex-col justify-between text-left group transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle poster background preview in watchlist items */}
                  {movie.image_url && (
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 bg-center bg-cover pointer-events-none" style={{ backgroundImage: `url(${movie.image_url})` }} />
                  )}

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-indigo-300 font-bold">
                        {movie.genre.split(" / ")[0]}
                      </span>
                      <span className="text-yellow-400 text-[10px] font-bold">★ {movie.imdb_rating || "8.1"}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate" title={movie.title}>
                      {movie.title}
                    </h4>

                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {movie.region} ({movie.year})
                    </p>
                  </div>

                  {/* Watchlist Actions */}
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/5 relative z-10 justify-between">
                    <button
                      onClick={() => {
                        // Project this movie immediately into stage
                        const mockResult: QueryResponse = {
                          action_type: "movie_finder",
                          movies: [movie],
                          ui_metadata: {
                            environment_3d: "cozy_vintage_theater",
                            color_palette: ["#1e1b4b", "#c2410c", "#0f172a"],
                            interaction_sounds: {
                              click_sound: "vintage_click",
                              hover_sound: "static_crackle",
                              ambience: "space_drones"
                            }
                          }
                        };
                        setMovieResult(mockResult);
                        setCurrentMovieIndex(0);
                        if (audioEnabled) {
                          playClickSound("soft_bubble_pop");
                        }
                        // Smooth scroll
                        setTimeout(() => {
                          const stageEl = document.getElementById("ai_recommendations_sec");
                          if (stageEl) {
                            stageEl.scrollIntoView({ behavior: "smooth" });
                          }
                        }, 50);
                      }}
                      className="text-[9px] font-mono text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <PlayCircle className="w-3 h-3 text-indigo-400" />
                      <span>Project Vibe</span>
                    </button>

                    <button
                      onClick={() => handleRemoveFromWatchlist(movie.title)}
                      className="text-[9px] font-mono text-zinc-500 hover:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                      title="Delete this movie from local watchlist queue"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-950/10 border border-white/5 rounded-2xl p-10 text-center text-zinc-500">
              <Bookmark className="w-8 h-8 mx-auto text-zinc-600 mb-2 stroke-[1.5px]" />
              <p className="text-xs">No movies locked in your Chamber yet. Click "+ Add to Watchlist" on any active recommendation!</p>
            </div>
          )}
        </section>

      </main>

      {/* CineMia virtual 3D Assistant girl integration */}
      <AIAssistant
        onQuickSelectMoods={(moods) => {
          setSelectedMoods(moods as MoodType[]);
          setActiveTab("mood_matcher");
          // Smooth scroll and handle query submit
          setTimeout(() => {
            const el = document.getElementById("genre_explorer_sec");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
        onQuickQuery={(q) => {
          setQueryText(q);
          setActiveTab("movie_finder");
          // Scroll and handle query submit
          setTimeout(() => {
            const el = document.getElementById("genre_explorer_sec");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
        audioActive={audioEnabled}
      />

      {/* Footer system details */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black/80 text-zinc-500 font-mono text-[10px] mt-24">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-zinc-300 font-bold uppercase tracking-wider">Immersive Movie Finder Online</span>
            </div>
            <p className="text-[9px] text-zinc-500">Equipped with 3D projection beam and adaptive audio synth nodes.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span>Model: gemini-3.5-flash AI</span>
            <span>Local Curation Cache: Persisted</span>
            <span>&copy; 2026 Immersive Movie Finder Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

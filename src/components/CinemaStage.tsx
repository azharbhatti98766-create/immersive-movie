import React, { useState } from "react";
import { Sparkles, Trophy, Calendar, Info, Play, RefreshCw, AudioLines, Music } from "lucide-react";
import { Movie, UiMetadata } from "../types";
import { playClickSound, playHoverSound, getSoundtrackSignature } from "../utils/audioSynth";

interface CinemaStageProps {
  movie: Movie;
  uiMetadata: UiMetadata;
  isLoading: boolean;
  onExploreMore: () => void;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  audioActive: boolean;
}

export default function CinemaStage({
  movie,
  uiMetadata,
  isLoading,
  onExploreMore,
  index,
  total,
  onNext,
  onPrev,
  audioActive,
}: CinemaStageProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Handle subtle 3D hover tilt effect on the cinema screen card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    // Cap rotation at moderate angles for pristine visual style
    const factorX = (y / (box.height / 2)) * -6;
    const factorY = (x / (box.width / 2)) * 6;
    setTilt({ x: factorX, y: factorY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Helper selectors for theme overlays based on env
  const env = uiMetadata.environment_3d;
  const isHorror = env.includes("horror") || env.includes("train") || env.includes("cabin") || env.includes("bloody");
  const isCyber = env.includes("cyberpunk") || env.includes("neon");
  const isSpace = env.includes("space") || env.includes("galaxy") || env.includes("cosmic");
  const isRain = env.includes("rain") || env.includes("tokyo");
  const isComedy = env.includes("comedy") || env.includes("bright") || env.includes("club");

  const colors = uiMetadata.color_palette || ["#2a2a2a", "#f59e0b", "#6366f1"];

  // Return a beautiful synthetic illustration gradient base on color scheme to acts as "Movie Backdrop poster"
  const backdropGradient = `linear-gradient(135deg, ${colors[0] || "#1e1e24"} 0%, ${colors[1] || "#2a2a35"} 50%, ${colors[2] || "#0f0f12"} 100%)`;

  const triggerInteraction = (type: "click" | "hover") => {
    if (!audioActive) return;
    if (type === "click") {
      playClickSound(uiMetadata.interaction_sounds.click_sound);
    } else {
      playHoverSound(uiMetadata.interaction_sounds.hover_sound);
    }
  };

  return (
    <div 
      id="cinema_stage_container"
      className="w-full relative py-6 px-1 flex flex-col items-center transition-all duration-1000 overflow-hidden"
    >
      {/* Immersive background spotlights reflecting the active hex color codes as ambient backlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-35 transition-all duration-1000 animate-pulse"
          style={{ backgroundImage: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute -bottom-40 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 transition-all duration-1000"
          style={{ backgroundImage: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full blur-[130px] opacity-25 transition-all duration-1000"
          style={{ backgroundImage: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)` }}
        />

        {/* Cinematic ambient particle grid overlays based on active environment */}
        {isCyber && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,36,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] opacity-40 z-1" />
        )}
        {isHorror && (
          <div className="absolute inset-0 bg-red-950/50 backdrop-contrast-125 mix-blend-color-burn pointer-events-none noise-overlay z-1 select-none opacity-30 bg-repeat bg-contain" style={{ backgroundImage: "radial-gradient(circle, transparent 20%, #110101 90%)" }} />
        )}
        {isSpace && (
          <div className="absolute inset-0 select-none opacity-50 z-1 pointer-events-none">
            <div className="stars-cluster absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
            <div className="stars-cluster-two absolute inset-0 bg-[radial-gradient(white_1.5px,transparent_1.5px)] bg-[size:48px_48px] opacity-20 animate-pulse" />
          </div>
        )}
        {isRain && (
          <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.7)_100%)] opacity-80 z-1">
            <div className="rain-lines absolute inset-0 bg-[linear-gradient(171deg,transparent_90%,rgba(255,255,255,0.1)_95%)] bg-[size:15px_150px] opacity-40" />
          </div>
        )}
      </div>

      {/* 3D Perspective Theatre Screen View */}
      <div className="w-full max-w-4xl px-4 z-10 flex flex-col items-center">
        {/* Projector beam visual source */}
        <div className="w-12 h-1.5 bg-white/70 rounded-full shadow-lg shadow-white/30 mb-8 animate-pulse relative">
          <div 
            className="absolute top-1 left-1/2 -translate-x-1/2 w-48 h-24 blur-xl opacity-20 origin-top rotate-[5deg] transition-all duration-1000 pointer-events-none"
            style={{ backgroundImage: `conic-gradient(from 180deg at 50% 0%, ${colors[0]}88, transparent)` }}
          />
        </div>

        {/* High-End Responsive Cinematic Screen card */}
        <div
          id="cinema_projection_screen"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`,
            transition: 'transform 0.15s ease-out, border-color 0.8s, box-shadow 0.8s',
            borderColor: `${colors[1]}55`,
            boxShadow: `0 25px 50px -12px ${colors[0]}33, 0 0 40px ${colors[1]}15`
          }}
          className="w-full rounded-2xl border bg-black/70 backdrop-blur-md overflow-hidden shadow-2xl transition-all relative group"
        >
          {/* Inner ambient outline reflecting state */}
          <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />

          {/* Interactive Screen Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            
            {/* Left Movie Block poster rendering */}
            <div 
              className="md:col-span-4 min-h-[250px] md:min-h-[380px] p-6 flex flex-col justify-between relative overflow-hidden text-white transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
              style={{ 
                background: movie.image_url 
                  ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${movie.image_url}) center/cover no-repeat` 
                  : backdropGradient 
              }}
            >
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 z-0" />

              {/* Dynamic noise screen effects */}
              <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:16px_16px] opacity-[0.03] z-1 pointer-events-none" />

              <div className="z-10 flex justify-between items-start">
                <span className="px-2.5 py-1 rounded bg-black/50 backdrop-blur-md text-[10px] tracking-widest font-mono font-semibold text-white/90 border border-white/10 uppercase">
                  {movie.region} Cinema
                </span>
                
                <div 
                  className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md text-[10px] font-mono font-semibold"
                  style={{ color: colors[1] }}
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{movie.confidence_score}% Match</span>
                </div>
              </div>

              {/* Pseudo Visual Art Poster */}
              <div className="z-10 text-left mt-auto space-y-3">
                <div className="w-8 h-1 rounded-full" style={{ backgroundColor: colors[1] }} />
                <h3 className="text-2xl font-black tracking-tight leading-tight filter drop-shadow font-sans">
                  {movie.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-white/85 font-mono">
                  <span className="flex items-center gap-1 font-semibold">
                    <Calendar className="w-3 h-3 text-white/60" /> {movie.year}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40 hidden sm:inline" />
                  <span className="truncate max-w-[130px]" title={movie.genre}>{movie.genre}</span>
                </div>

                {/* Star rating Display and custom preview button */}
                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-yellow-500/30 w-fit">
                    <span className="text-yellow-400">★</span> 
                    <span>IMDb Score: {movie.imdb_rating || "8.1/10"}</span>
                  </div>

                  {movie.imdb_url && (
                    <a
                      href={movie.imdb_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerInteraction("click")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold font-mono text-[10px] rounded-lg tracking-wider transition-all duration-300 hover:shadow-lg shadow-yellow-500/20 active:scale-95 cursor-pointer uppercase"
                      id="poster_imdb_link"
                    >
                      <span>Preview on IMDb</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Curation Details Block */}
            <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between bg-zinc-950/80 text-left text-white relative">
              
              <div className="space-y-5">
                {/* Header detail */}
                <div>
                  <h4 className="text-xs text-zinc-500 font-mono tracking-widest uppercase font-semibold">
                    The Storyline Synopsis
                  </h4>
                  <p className="text-sm md:text-base text-zinc-300 mt-2 font-sans font-normal leading-relaxed">
                    {movie.synopsis}
                  </p>
                </div>

                {/* Match criteria detail */}
                <div 
                  className="p-4 rounded-xl border bg-black/40 relative overflow-hidden transition-all duration-700"
                  style={{ borderColor: `${colors[2]}22` }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <h5 
                    className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: colors[1] }}
                  >
                    <Info className="w-3.5 h-3.5" />
                    Film Detective Verdict
                  </h5>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-sans">
                    {movie.match_reason}
                  </p>
                </div>

                {/* Dynamically Generated Real-time BGM Track Card */}
                {(() => {
                  const sig = getSoundtrackSignature(movie.title, movie.genre);
                  return (
                    <div className="p-4 rounded-xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/20 via-indigo-950/40 to-black/60 relative overflow-hidden transition-all duration-500 shadow-xl">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 shrink-0">
                          <Music className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              Track BGM (Procedural Synth)
                            </span>
                            {audioActive && (
                              <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-mono font-bold animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                                LIVE SYNTH
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {sig.title}
                          </h4>
                          <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
                            <span>Key: <strong className="text-zinc-200">{sig.keyName}</strong></span>
                            <span className="text-zinc-600">&bull;</span>
                            <span>Instruments: <strong className="text-indigo-300">{sig.instrumentName}</strong></span>
                            <span className="text-zinc-600">&bull;</span>
                            <span>Tempo: <strong className="text-emerald-400">{sig.tempo} BPM</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sound Cues Visual Mixer Panel */}
              <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                
                {/* Audio previews triggers built inline */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold flex items-center gap-1">
                    <AudioLines className="w-3 h-3 text-zinc-400" /> Interaction Soundboard
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerInteraction("click")}
                      onMouseEnter={() => triggerInteraction("hover")}
                      className="px-2.5 py-1 text-[10px] font-mono bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 hover:border-white/30 rounded text-zinc-300 flex items-center gap-1 transition-all"
                      title="Synthesize and play the matched Click Sound Effect"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Click: <span className="font-semibold text-white">{uiMetadata.interaction_sounds.click_sound}</span>
                    </button>

                    <button
                      onClick={() => triggerInteraction("hover")}
                      className="px-2.5 py-1 text-[10px] font-mono bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 hover:border-white/30 rounded text-zinc-300 flex items-center gap-1 transition-all"
                      title="Synthesize and play the matched Hover sound sweep"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Hover: <span className="font-semibold text-white">{uiMetadata.interaction_sounds.hover_sound}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-sound status metrics info bar */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 px-3 py-1.5 rounded-lg bg-black/60 border border-white/5">
                  <Music className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Ambiance: <b className="text-zinc-300 lowercase">{uiMetadata.interaction_sounds.ambience.replace(/_/g, " ")}</b></span>
                </div>

              </div>

            </div>

          </div>

          {/* Film Counter & Carousel controls */}
          {total > 1 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-20">
              <span className="text-xs bg-black/70 backdrop-blur border border-white/10 px-2 py-1 rounded font-mono text-white/80 mr-1.5">
                {index + 1} / {total}
              </span>
              <button 
                onClick={onPrev}
                className="p-1 px-2.5 bg-black/80 hover:bg-white/10 border border-white/15 hover:border-white/30 rounded text-white text-xs font-mono transition-all font-bold"
              >
                &lsaquo;
              </button>
              <button 
                onClick={onNext}
                className="p-1 px-2.5 bg-black/80 hover:bg-white/10 border border-white/15 hover:border-white/30 rounded text-white text-xs font-mono transition-all font-bold"
              >
                &rsaquo;
              </button>
            </div>
          )}

        </div>

        {/* Action button options */}
        <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={() => {
              triggerInteraction("click");
              onExploreMore();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-mono border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition-all hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            RESET MATCH FINDER
          </button>

          {movie.imdb_url && (
            <a
              href={movie.imdb_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerInteraction("click")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold font-mono bg-yellow-500 hover:bg-yellow-400 text-black transition-all hover:shadow-lg hover:shadow-yellow-500/10 active:scale-95 duration-200 cursor-pointer font-extrabold uppercase"
              id="imdb_bottom_link"
            >
              <span>🎬 OPEN IMDB PREVIEW ({movie.imdb_rating || "★ 8.2"})</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}

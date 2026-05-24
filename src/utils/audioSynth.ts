// Native Web Audio API sound generator to synthesize immersive cat vocalizations dynamically.

let audioCtx: AudioContext | null = null;
let ambientOscillator: OscillatorNode | null = null;
let ambientGainNode: GainNode | null = null;
let noiseFilterNode: BiquadFilterNode | null = null;
let noiseSourceNode: AudioWorkletNode | ScriptProcessorNode | null = null;
let activeBGMTimer: any = null;
let bgmActiveOscillators: OscillatorNode[] = [];

export function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// 1. Delightful procedurally-synthesized cute kitten "Meow" sound
export function playCuteMeow() {
  try {
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    // Use two vocal formants (carrier + overtone) to craft an organic-sounding "mew"
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    
    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();

    // Soft lowpass filter to replicate smooth throat resonance
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, now);

    osc1.connect(gain1);
    osc2.connect(gain2);
    
    gain1.connect(filter);
    gain2.connect(filter);
    
    filter.connect(audioCtx.destination);

    // Warm, adorable kitten starting register pitch (high-frequency slide)
    const baseFreq = 540;

    osc1.type = "triangle"; // soft base voice
    osc2.type = "sawtooth"; // sharp cute accent flare

    // Frequency slide tracks the "m-e-o-w" formant trajectory
    // Starts at 540Hz, spikes up around 880Hz, then glides gently down to 420Hz
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.10);
    osc1.frequency.exponentialRampToValueAtTime(420, now + 0.35);

    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(880 * 1.5, now + 0.10);
    osc2.frequency.exponentialRampToValueAtTime(420 * 1.5, now + 0.35);

    // Cat vocal swell envelope: quickly rises on the initial mouth opening, peaks, then glides away
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.07); // Swell
    gain1.gain.exponentialRampToValueAtTime(0.07, now + 0.18);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38); // Decay

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.03, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.015, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  } catch (e) {
    console.warn("Meow voice generator failed:", e);
  }
}

// Play click sound triggers the cute cat meow directly
export function playClickSound(soundType?: string) {
  playCuteMeow();
}

// 2. Synthesize organic mouse squeaks or tiny cat chirp for hover elements
export function playHoverSound(soundType?: string) {
  try {
    initAudioContext();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    // High subtle "chirp" for hovering items
    osc.type = "sine";
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {
    console.warn("Chirp hover failed:", e);
  }
}

// 3. Ambient looping soundtrack - replaced with a relaxing cat purring simulation loop!
export function stopAmbientLoop() {
  try {
    if (activeBGMTimer) {
      clearInterval(activeBGMTimer);
      activeBGMTimer = null;
    }
    bgmActiveOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (err) {}
    });
    bgmActiveOscillators = [];

    if (ambientOscillator) {
      ambientOscillator.stop();
      ambientOscillator.disconnect();
      ambientOscillator = null;
    }
    if (ambientGainNode) {
      ambientGainNode.disconnect();
      ambientGainNode = null;
    }
    if (noiseSourceNode) {
      noiseSourceNode.disconnect();
      noiseSourceNode = null;
    }
    if (noiseFilterNode) {
      noiseFilterNode.disconnect();
      noiseFilterNode = null;
    }
  } catch (e) {
    console.warn("Stop ambient failed:", e);
  }
}

// Dynamic Kitty Purring ambiance loop synthesizer (super cozy and healing)
export function startAmbientLoop(ambienceName?: string) {
  try {
    stopAmbientLoop();
    initAudioContext();
    if (!audioCtx) return;

    ambientGainNode = audioCtx.createGain();
    ambientGainNode.connect(audioCtx.destination);
    ambientGainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);

    const now = audioCtx.currentTime;

    // A real cat purr is generated by low frequencies (~25Hz) modulated by a breathing cycle LFO
    ambientOscillator = audioCtx.createOscillator();
    ambientOscillator.type = "sine";
    ambientOscillator.frequency.setValueAtTime(26, now); // Sweet spot for cat purr resonance

    // Breathing rhythm LFO (modulates the gain/amplitude around 3 Hz)
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(3.8, now); // Purr rate

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(7, now); // FM pitch wobble

    lfo.connect(lfoGain);
    lfoGain.connect(ambientOscillator.frequency);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(110, now);

    ambientOscillator.connect(filter);
    filter.connect(ambientGainNode);

    lfo.start(now);
    ambientOscillator.start(now);

    // Stop helper nodes upon cancellation
    bgmActiveOscillators.push(lfo as any); 
  } catch (e) {
    console.warn("Purr loop failed:", e);
  }
}

// 4. Custom Bingo chime: cute kitten happy triple meow chirrup!
export function playBingoSound() {
  try {
    initAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // Staggered double rapid happy meows!
    playCuteMeow();
    setTimeout(() => {
      playCuteMeow();
    }, 180);
    setTimeout(() => {
      // Higher tiny chirp of joy
      try {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const t = audioCtx.currentTime;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(750, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.1);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.11);
      } catch (e) {}
    }, 320);
  } catch (e) {
    console.warn("Happy cat chime failed:", e);
  }
}

export function playMatchSearchTriggerSound() {
  // Sound made when match begins
  playCuteMeow();
}

export function getSoundtrackSignature(movieTitle: string, genre: string) {
  let hash = 0;
  for (let i = 0; i < movieTitle.length; i++) {
    hash = movieTitle.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const keys = [
    "Kitten Purr C-Major Resonance",
    "Soft Whiskers Vocal Frequency",
    "Paws & Claws Cozy Acoustic Cadence"
  ];
  const instruments = [
    "Procedural Kitty Vocal Chord",
    "Analog Pure purr engine",
    "Cozy Soft Meow oscillator"
  ];
  
  const keyName = keys[hash % keys.length];
  const instrumentName = instruments[(hash + 3) % instruments.length];

  return {
    keyName,
    instrumentName,
    tempo: 120,
    title: `Purrssian Soundtrack for ${movieTitle}`
  };
}

// Turn this into a gentle cozy repeat purr instead of any synth music tracker loops
export function startMovieSpecificBGM(movieTitle: string, genreText: string) {
  startAmbientLoop();
}


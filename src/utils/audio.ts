// Web Audio API sound generator for royal wedding ambiance and envelope interaction
// Designed to be lightweight, zero external file dependency, and fully functional on iPhone Safari

let audioCtx: AudioContext | null = null;
let ambientInterval: number | null = null;
let isMusicPlaying = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function resumeAudioContextIfNeeded(): Promise<void> | void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    return ctx.resume().catch(() => {});
  }
}

/**
 * Play a rich ceremonial chime & envelope rustle sound when unsealing
 */
export function playEnvelopeOpenSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Gentle paper slide / swoosh noise
  try {
    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.08, now + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.4);
  } catch {
    // Graceful fallback
  }

  // 2. Royal melodic chime (Pentatonic Yaman notes: D4, F#4, A4, D5)
  const notes = [293.66, 369.99, 440.00, 587.33];
  notes.forEach((freq, idx) => {
    const noteTime = now + 0.12 + idx * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    // Warm harmonics
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, noteTime);

    gain.gain.setValueAtTime(0.0001, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.12, noteTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

    gain2.gain.setValueAtTime(0.0001, noteTime);
    gain2.gain.exponentialRampToValueAtTime(0.03, noteTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.8);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 1.3);
    osc2.start(noteTime);
    osc2.stop(noteTime + 0.9);
  });
}

/**
 * Play a light golden bell chime for button clicks
 */
export function playSoftChime(freq = 523.25) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.55);
}

/**
 * Ambient royal Santoor/Harp sequence (Raga Yaman celebration notes)
 */
const celebrationMelody = [
  { freq: 293.66, dur: 0.6 }, // D
  { freq: 369.99, dur: 0.6 }, // F#
  { freq: 440.00, dur: 0.7 }, // A
  { freq: 554.37, dur: 0.6 }, // C#
  { freq: 587.33, dur: 1.2 }, // D
  { freq: 554.37, dur: 0.5 },
  { freq: 440.00, dur: 0.7 },
  { freq: 369.99, dur: 0.8 },
  { freq: 329.63, dur: 0.6 }, // E
  { freq: 293.66, dur: 1.5 }, // D
];

let melodyIndex = 0;

export function startAmbientCelebrationMusic() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (isMusicPlaying) return;

  isMusicPlaying = true;

  const playNextNote = () => {
    if (!isMusicPlaying || !audioCtx) return;
    const item = celebrationMelody[melodyIndex % celebrationMelody.length];
    melodyIndex++;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(item.freq, now);

    // Warm overtone for santur/sitar bell timber
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(item.freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (item.dur + 0.5));

    subGain.gain.setValueAtTime(0.0001, now);
    subGain.gain.exponentialRampToValueAtTime(0.02, now + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + (item.dur + 0.3));

    osc.connect(gain);
    subOsc.connect(subGain);
    gain.connect(audioCtx.destination);
    subGain.connect(audioCtx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + item.dur + 0.6);
    subOsc.stop(now + item.dur + 0.4);

    const nextDelay = item.dur * 1000 + 150;
    ambientInterval = window.setTimeout(playNextNote, nextDelay);
  };

  playNextNote();
}

export function stopAmbientCelebrationMusic() {
  isMusicPlaying = false;
  if (ambientInterval) {
    clearTimeout(ambientInterval);
    ambientInterval = null;
  }
}

export function isCelebrationMusicActive(): boolean {
  return isMusicPlaying;
}

// Web Audio API sound generator for royal wedding ambiance and envelope interaction
// Designed to be lightweight, zero external file dependency, and fully functional on iPhone Safari

let audioCtx: AudioContext | null = null;
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
 * Background music: "Heartwarming" by Kevin MacLeod (incompetech.com),
 * a soft romantic piano piece with gentle strings.
 * Licensed under Creative Commons: By Attribution 4.0 — http://creativecommons.org/licenses/by/4.0/
 *
 * The track is decoded with the Web Audio API and looped with a smooth
 * crossfade so there is never a gap or sudden cut (works on iPhone Safari,
 * where HTMLAudioElement.volume cannot be changed).
 */

const MUSIC_URL = '/audio/romantic-piano.mp3';
const MUSIC_VOLUME = 0.25; // ~25%
const FADE_IN_SECONDS = 3;
const LOOP_CROSSFADE_SECONDS = 4;

let musicData: Promise<ArrayBuffer> | null = null;
let musicBuffer: AudioBuffer | null = null;
let musicTrim = { start: 0, end: 0 };
let masterGain: GainNode | null = null;
let activeVoices: { src: AudioBufferSourceNode; gain: GainNode }[] = [];
let nextLoopTimer: number | null = null;
let playToken = 0;
let userMusicEnabled = true;
const musicListeners = new Set<(on: boolean) => void>();

function notifyMusicListeners() {
  const on = isMusicPlaying;
  musicListeners.forEach((fn) => fn(on));
}

/** Start downloading the track early so playback begins quickly on tap */
export function preloadBackgroundMusic() {
  if (typeof window === 'undefined' || musicData) return;
  musicData = fetch(MUSIC_URL)
    .then((res) => {
      if (!res.ok) throw new Error('Music download failed');
      return res.arrayBuffer();
    })
    .catch((err) => {
      musicData = null;
      throw err;
    });
}

function findAudibleRange(buffer: AudioBuffer) {
  const threshold = 0.003;
  const data = buffer.getChannelData(0);
  let start = 0;
  let end = data.length - 1;
  while (start < end && Math.abs(data[start]) < threshold) start++;
  while (end > start && Math.abs(data[end]) < threshold) end--;
  return { start: start / buffer.sampleRate, end: end / buffer.sampleRate };
}

async function loadMusicBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (musicBuffer) return musicBuffer;
  preloadBackgroundMusic();
  const data = await musicData!;
  // decodeAudioData detaches the buffer, so decode a copy
  const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
    ctx.decodeAudioData(data.slice(0), resolve, reject);
  });
  musicBuffer = decoded;
  musicTrim = findAudibleRange(decoded);
  return decoded;
}

function playVoice(ctx: AudioContext, buffer: AudioBuffer, when: number, fadeIn: number, token: number) {
  if (!masterGain || token !== playToken) return;
  const { start, end } = musicTrim;
  const duration = Math.max(end - start, 1);
  const crossfade = Math.min(LOOP_CROSSFADE_SECONDS, duration / 4);

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(1, when + fadeIn);
  gain.gain.setValueAtTime(1, when + duration - crossfade);
  gain.gain.linearRampToValueAtTime(0, when + duration);
  src.connect(gain);
  gain.connect(masterGain);
  src.start(when, start, duration);
  src.stop(when + duration + 0.05);

  const voice = { src, gain };
  activeVoices.push(voice);
  src.onended = () => {
    activeVoices = activeVoices.filter((v) => v !== voice);
    try { gain.disconnect(); } catch { /* noop */ }
  };

  // Queue the next pass (well ahead of time, so throttled background timers
  // can't cause a gap) to start exactly as this one begins fading out
  const nextStart = when + duration - crossfade;
  const delayMs = Math.max((when - ctx.currentTime) * 1000, 0) + 500;
  nextLoopTimer = window.setTimeout(() => {
    if (token !== playToken || !isMusicPlaying) return;
    playVoice(ctx, buffer, nextStart, crossfade, token);
  }, delayMs);
}

export function startAmbientCelebrationMusic() {
  if (!userMusicEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (isMusicPlaying) return;

  isMusicPlaying = true;
  const token = ++playToken;
  notifyMusicListeners();

  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(MUSIC_VOLUME, now);

  loadMusicBuffer(ctx)
    .then((buffer) => {
      if (token !== playToken || !isMusicPlaying) return;
      playVoice(ctx, buffer, ctx.currentTime + 0.05, FADE_IN_SECONDS, token);
    })
    .catch(() => {
      if (token !== playToken) return;
      isMusicPlaying = false;
      notifyMusicListeners();
    });
}

export function stopAmbientCelebrationMusic() {
  if (!isMusicPlaying) return;
  isMusicPlaying = false;
  playToken++;
  if (nextLoopTimer) {
    clearTimeout(nextLoopTimer);
    nextLoopTimer = null;
  }
  if (audioCtx && masterGain) {
    const ctx = audioCtx;
    const now = ctx.currentTime;
    const fadeOut = 0.8;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + fadeOut);
    activeVoices.forEach(({ src }) => {
      try { src.stop(now + fadeOut + 0.05); } catch { /* noop */ }
    });
  }
  notifyMusicListeners();
}

export function isCelebrationMusicActive(): boolean {
  return isMusicPlaying;
}

/** Toggle background music on/off from the guest-facing control */
export function toggleBackgroundMusic(): boolean {
  if (isMusicPlaying) {
    userMusicEnabled = false;
    stopAmbientCelebrationMusic();
  } else {
    userMusicEnabled = true;
    startAmbientCelebrationMusic();
  }
  return isMusicPlaying;
}

export function subscribeToMusicState(listener: (on: boolean) => void): () => void {
  musicListeners.add(listener);
  return () => {
    musicListeners.delete(listener);
  };
}

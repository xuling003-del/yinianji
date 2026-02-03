
export const initAudio = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  
  const ctx = new AudioContext();
  return ctx;
};

// Singleton context
let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = initAudio();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playOsc = (freq: number, type: OscillatorType, duration: number, startTimeRel: number = 0, vol: number = 0.1) => {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeRel);

  gain.gain.setValueAtTime(vol, ctx.currentTime + startTimeRel);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTimeRel + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTimeRel);
  osc.stop(ctx.currentTime + startTimeRel + duration);
};

export const playClick = () => {
  playOsc(800, 'sine', 0.1, 0, 0.05);
};

export const playCorrect = () => {
  playOsc(523.25, 'sine', 0.2, 0, 0.1); // C5
  playOsc(659.25, 'sine', 0.2, 0.1, 0.1); // E5
  playOsc(783.99, 'sine', 0.4, 0.2, 0.1); // G5
};

export const playIncorrect = () => {
  playOsc(300, 'sawtooth', 0.3, 0, 0.05);
  playOsc(200, 'sawtooth', 0.3, 0.15, 0.05);
};

export const playFanfare = () => {
  const now = 0;
  playOsc(523.25, 'triangle', 0.3, now, 0.1); // C5
  playOsc(659.25, 'triangle', 0.3, now + 0.15, 0.1); // E5
  playOsc(783.99, 'triangle', 0.3, now + 0.3, 0.1); // G5
  playOsc(1046.50, 'triangle', 0.8, now + 0.45, 0.15); // C6
};

export const playUnlock = () => {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.5);
  
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

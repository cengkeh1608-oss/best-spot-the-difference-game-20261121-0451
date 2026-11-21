// audio.js — all sounds are synthesised with WebAudio; no audio files.
// The game never loads anything over the network.

let ctx = null;
let muted = false;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, startAt, dur, type, vol) {
  const ac = ensure();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol || 0.18, ac.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

/** Two-note happy ding when a difference is found. */
export function playFound() {
  tone(880, 0, 0.12, 'sine', 0.2);
  tone(1318, 0.09, 0.22, 'sine', 0.2);
}

/** Low buzz for a wrong click. */
export function playWrong() {
  tone(160, 0, 0.18, 'sawtooth', 0.12);
  tone(110, 0.05, 0.2, 'sawtooth', 0.1);
}

/** Short click for buttons and keyboard moves. */
export function playClick() {
  tone(660, 0, 0.05, 'triangle', 0.1);
}

/** Rising arpeggio when a level is cleared. */
export function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => tone(n, i * 0.11, 0.28, 'triangle', 0.2));
}

/** Soft chime when a hint is used. */
export function playHint() {
  tone(1174, 0, 0.15, 'sine', 0.14);
  tone(1567, 0.1, 0.2, 'sine', 0.12);
}

/** Tick when the timer drops under 10 seconds. */
export function playTick() {
  tone(1200, 0, 0.05, 'square', 0.06);
}

/** Unlock audio on the first user gesture (browsers require it). */
export function unlockAudio() {
  ensure();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

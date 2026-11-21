// main.js — "PASAR MALAM — Cari Bedanya!" game logic.
// Two near-identical panels side by side; click the difference on either
// panel. Markers land on both panels; a counter shows how many remain.

import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { attachInput } from './input.js';
import { playFound, playWrong, playClick, playWin, playHint, playTick, unlockAudio, toggleMute, isMuted } from './audio.js';
import { getStaging } from './shots.js';

const GAP = 20;
const PAD = 20;
const CANVAS_W = PAD * 2 + PANEL_W * 2 + GAP; // 1260
const CANVAS_H = PAD * 2 + PANEL_H;           // 500
const LEFT_X = PAD;
const RIGHT_X = PAD + PANEL_W + GAP;
const PANEL_Y = PAD;

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const $ = (id) => document.getElementById(id);
const hudLevel = $('hud-level');
const hudFound = $('hud-found');
const hudLeft = $('hud-left');
const hudTimer = $('hud-timer');
const hudScore = $('hud-score');
const hudHints = $('hud-hints');
const timerBar = $('timer-bar');
const toastEl = $('toast');
const overlayEl = $('overlay');
const overlayTitle = $('overlay-title');
const overlayText = $('overlay-text');
const overlayBtn = $('overlay-btn');
const levelDots = $('level-dots');

const state = {
  sceneIndex: 0,
  found: new Set(),
  score: 0,
  timeLeft: 0,
  hintsLeft: 3,
  magnifier: false,
  hintRing: null,      // { diff, until }
  wrongFlash: null,    // { x, y, until }
  phase: 'title',      // title | playing | levelClear | timeUp | gameOver
  lastTickSecond: -1,
  staging: false,
};

const staging = getStaging();
if (staging) {
  state.staging = true;
  state.sceneIndex = staging.stage;
  state.phase = 'playing';
}

function scene() { return SCENES[state.sceneIndex]; }

function allDiffIds() {
  return new Set(scene().diffs.map((d) => d.id));
}

function remaining() {
  return scene().diffs.length - state.found.size;
}

function fmtTime(s) {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.floor(Math.max(0, s) % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function showToast(text, good) {
  toastEl.textContent = text;
  toastEl.className = 'toast show ' + (good === false ? 'bad' : 'good');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toastEl.className = 'toast'; }, 1800);
}

function updateHud() {
  const s = scene();
  hudLevel.textContent = `${s.name} — ${s.sub}`;
  hudFound.textContent = `Ditemukan ${state.found.size}/${s.diffs.length}`;
  hudLeft.textContent = `Sisa: ${remaining()}`;
  hudTimer.textContent = fmtTime(state.timeLeft);
  hudScore.textContent = `Skor: ${state.score}`;
  hudHints.textContent = `Hint: ${state.hintsLeft}`;
  const frac = Math.max(0, state.timeLeft / s.timeLimit);
  timerBar.style.width = `${frac * 100}%`;
  timerBar.className = 'timer-fill' + (state.timeLeft <= 10 && state.phase === 'playing' ? ' low' : '');
  levelDots.innerHTML = SCENES.map((sc, i) =>
    `<span class="dot${i === state.sceneIndex ? ' now' : ''}${i < state.sceneIndex ? ' done' : ''}">${i + 1}</span>`
  ).join('');
}

function showOverlay(title, text, btnLabel, onBtn) {
  overlayTitle.textContent = title;
  overlayText.innerHTML = text;
  overlayBtn.textContent = btnLabel;
  overlayEl.classList.remove('hidden');
  overlayBtn.onclick = () => {
    unlockAudio();
    playClick();
    overlayEl.classList.add('hidden');
    if (onBtn) onBtn();
  };
}

function startLevel(index) {
  state.sceneIndex = index;
  state.found = new Set();
  state.timeLeft = scene().timeLimit;
  state.hintsLeft = 3;
  state.hintRing = null;
  state.wrongFlash = null;
  state.lastTickSecond = -1;
  state.phase = 'playing';
  if (state.staging) {
    // Screenshot staging: pre-mark the first K differences, freeze the clock.
    const k = Math.min(staging.found, scene().diffs.length);
    for (let i = 0; i < k; i++) state.found.add(scene().diffs[i].id);
    state.timeLeft = scene().timeLimit - 37;
  }
  updateHud();
}

function levelClear() {
  state.phase = 'levelClear';
  const bonus = Math.floor(state.timeLeft) * 5;
  state.score += bonus;
  playWin();
  updateHud();
  const last = state.sceneIndex === SCENES.length - 1;
  showOverlay(
    last ? 'Semua Level Selesai!' : `Level ${state.sceneIndex + 1} Selesai!`,
    last
      ? `Kamu menemukan semua ${SCENES.reduce((n, s) => n + s.diffs.length, 0)} perbedaan di 4 tempat.<br>Bonus waktu: +${bonus} &nbsp;•&nbsp; Skor akhir: <b>${state.score}</b>`
      : `Semua ${scene().diffs.length} perbedaan ketemu!<br>Bonus waktu: +${bonus} &nbsp;•&nbsp; Skor: <b>${state.score}</b>`,
    last ? 'Main Lagi' : 'Level Berikutnya (N)',
    () => {
      if (last) {
        state.score = 0;
        startLevel(0);
        showTitle();
      } else {
        startLevel(state.sceneIndex + 1);
      }
    },
  );
}

function timeUp() {
  state.phase = 'timeUp';
  playWrong();
  showOverlay(
    'Waktu Habis!',
    `Kamu menemukan ${state.found.size} dari ${scene().diffs.length} perbedaan di ${scene().name}.<br>Coba lagi — waktunya masih cukup kalau fokus.`,
    'Ulangi Level',
    () => startLevel(state.sceneIndex),
  );
}

function showTitle() {
  state.phase = 'title';
  showOverlay(
    'PASAR MALAM — Cari Bedanya!',
    'Dua gambar nyaris sama. Cari semua perbedaannya!<br>Klik perbedaan di gambar kiri ATAU kanan.<br><b>Panah</b> gerakkan bidikan • <b>Enter</b> pilih • <b>H</b> hint • <b>M</b> kaca pembesar<br>4 tempat • 37 perbedaan • makin lama makin susah.',
    'Mulai Main',
    () => startLevel(0),
  );
}

function pickAt(cx, cy) {
  if (state.phase !== 'playing') return;
  unlockAudio();
  // Which panel? Map canvas coords to panel-local coords.
  let localX = -1;
  if (cx >= LEFT_X && cx < LEFT_X + PANEL_W && cy >= PANEL_Y && cy < PANEL_Y + PANEL_H) {
    localX = cx - LEFT_X;
  } else if (cx >= RIGHT_X && cx < RIGHT_X + PANEL_W && cy >= PANEL_Y && cy < PANEL_Y + PANEL_H) {
    localX = cx - RIGHT_X;
  } else {
    return;
  }
  const localY = cy - PANEL_Y;
  const s = scene();
  // Nearest unfound difference within its radius (+8px forgiveness).
  let best = null;
  let bestD = Infinity;
  for (const d of s.diffs) {
    if (state.found.has(d.id)) continue;
    const dist = Math.hypot(localX - d.x, localY - d.y);
    if (dist <= d.r + 8 && dist < bestD) { best = d; bestD = dist; }
  }
  if (best) {
    state.found.add(best.id);
    const pts = 100 + Math.floor(state.timeLeft / 10) * 5;
    state.score += pts;
    playFound();
    showToast(`Ketemu: ${best.label}! +${pts}`, true);
    updateHud();
    if (state.found.size === s.diffs.length) levelClear();
  } else {
    state.score = Math.max(0, state.score - 25);
    state.timeLeft = Math.max(0, state.timeLeft - 3);
    state.wrongFlash = { x: cx, y: cy, until: performance.now() + 450 };
    playWrong();
    showToast('Bukan itu — minus 25 poin, minus 3 detik', false);
    updateHud();
  }
}

function useHint() {
  if (state.phase !== 'playing') return;
  if (state.hintsLeft <= 0) { showToast('Hint habis!', false); return; }
  const unfound = scene().diffs.filter((d) => !state.found.has(d.id));
  if (unfound.length === 0) return;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 50);
  state.hintRing = { diff: unfound[0], until: performance.now() + 2500 };
  playHint();
  showToast(`Hint: cari di sekitar “${unfound[0].label}” — minus 50 poin`, true);
  updateHud();
}

function drawMarker(x, y, r, found) {
  ctx.save();
  ctx.strokeStyle = found ? '#2ecc71' : '#ffd23c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  if (found) {
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.45, y);
    ctx.lineTo(x - r * 0.1, y + r * 0.4);
    ctx.lineTo(x + r * 0.5, y - r * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPanels(now) {
  const s = scene();
  // Left panel: original. Right panel: all differences applied.
  ctx.save();
  ctx.translate(LEFT_X, PANEL_Y);
  s.draw(ctx, new Set());
  ctx.restore();
  ctx.save();
  ctx.translate(RIGHT_X, PANEL_Y);
  s.draw(ctx, allDiffIds());
  ctx.restore();
  // Panel frames + labels
  for (const [px, label] of [[LEFT_X, 'ASLI'], [RIGHT_X, 'CARI BEDANYA']]) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, PANEL_Y, PANEL_W, PANEL_H);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(px + 8, PANEL_Y + 8, 132, 26);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, px + 18, PANEL_Y + 26);
  }
  // Found markers on both panels
  for (const d of s.diffs) {
    if (!state.found.has(d.id)) continue;
    drawMarker(LEFT_X + d.x, PANEL_Y + d.y, d.r, true);
    drawMarker(RIGHT_X + d.x, PANEL_Y + d.y, d.r, true);
  }
  // Hint ring (pulsing) on both panels
  if (state.hintRing && now < state.hintRing.until) {
    const d = state.hintRing.diff;
    const pulse = 1 + 0.15 * Math.sin(now / 120);
    for (const px of [LEFT_X, RIGHT_X]) {
      ctx.save();
      ctx.strokeStyle = '#ffd23c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px + d.x, PANEL_Y + d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  } else {
    state.hintRing = null;
  }
  // Wrong-click flash
  if (state.wrongFlash && now < state.wrongFlash.until) {
    const { x, y } = state.wrongFlash;
    ctx.save();
    ctx.strokeStyle = '#e05252';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
    ctx.restore();
  } else {
    state.wrongFlash = null;
  }
}

function drawMagnifier() {
  if (!state.magnifier) return;
  const mx = input.mouseX;
  const my = input.mouseY;
  if (mx < 0) return;
  const R = 90;
  const zoom = 2;
  const sw = (R * 2) / zoom;
  const sx = Math.max(0, Math.min(CANVAS_W - sw, mx - sw / 2));
  const sy = Math.max(0, Math.min(CANVAS_H - sw, my - sw / 2));
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, sx, sy, sw, sw, mx - R, my - R, R * 2, R * 2);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = '#ffd23c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(mx, my, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx + R * 0.7, my + R * 0.7);
  ctx.lineTo(mx + R + 18, my + R + 18);
  ctx.stroke();
  ctx.restore();
}

function drawCrosshair() {
  if (!input.usingKeys || state.phase !== 'playing') return;
  const x = input.crossX;
  const y = input.crossY;
  ctx.save();
  ctx.strokeStyle = '#ffd23c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, y); ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y); ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 20);
  ctx.stroke();
  ctx.restore();
}

let lastNow = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  if (state.phase === 'playing' && !state.staging) {
    state.timeLeft -= dt;
    const sec = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && sec !== state.lastTickSecond && state.timeLeft > 0) {
      state.lastTickSecond = sec;
      playTick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      timeUp();
    } else {
      updateHud();
    }
  }
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#1a1440';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawPanels(now);
  drawMagnifier();
  drawCrosshair();
  requestAnimationFrame(frame);
}

const input = attachInput(canvas, {
  onPick: (x, y) => pickAt(x, y),
  onKey: (name) => {
    if (name === 'hint') useHint();
    else if (name === 'magnifier') {
      state.magnifier = !state.magnifier;
      playClick();
      showToast(state.magnifier ? 'Kaca pembesar nyala (M)' : 'Kaca pembesar mati (M)', true);
    } else if (name === 'next') {
      if (state.phase === 'levelClear') overlayBtn.click();
    }
  },
});

$('btn-hint').addEventListener('click', () => { unlockAudio(); useHint(); });
$('btn-mag').addEventListener('click', () => {
  unlockAudio();
  state.magnifier = !state.magnifier;
  playClick();
  $('btn-mag').textContent = state.magnifier ? 'Kaca Pembesar: NYALA' : 'Kaca Pembesar (M)';
});
$('btn-mute').addEventListener('click', () => {
  const m = toggleMute();
  $('btn-mute').textContent = m ? 'Suara: MATI' : 'Suara: NYALA';
});
$('btn-restart').addEventListener('click', () => {
  unlockAudio();
  playClick();
  overlayEl.classList.add('hidden');
  startLevel(state.sceneIndex);
  if (!state.staging) showTitle();
});

if (state.staging) {
  startLevel(state.sceneIndex);
} else {
  startLevel(0);
  showTitle();
}
updateHud();
requestAnimationFrame(frame);

// Hooks for automated playtesting (Playwright).
window.__game = {
  state,
  scene,
  pickAt,
  useHint,
  startLevel,
  input,
  panelPoint(panel, dx, dy) {
    const baseX = panel === 'right' ? RIGHT_X : LEFT_X;
    return { x: baseX + dx, y: PANEL_Y + dy };
  },
};

// scenes.js — the 4 spot-the-difference scenes.
// Each scene draws BOTH panels with the same code: the left panel with no
// differences, the right panel with its full difference set applied.
// A difference is { id, x, y, r, label } — x/y/r in panel pixels (600x460).

import { star, bird, lantern, stall, tree, boat, lighthouse, stars, bulbString, shadow, roundRect, makeRng } from './draw.js';

export const PANEL_W = 600;
export const PANEL_H = 460;

function has(set, id) { return set.has(id); }

function skyGradient(ctx, stops, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [off, col] of stops) g.addColorStop(off, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, h);
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Pasar Malam (night market)                                */
/* ------------------------------------------------------------------ */
function drawPasar(ctx, d) {
  skyGradient(ctx, [[0, '#1a1440'], [1, '#3b1f5e']], 320);
  stars(ctx, PANEL_W, 320, 40, 11);
  // moon
  ctx.fillStyle = has(d, 'moon-color') ? '#ff9a3c' : '#ffe9a8';
  ctx.beginPath(); ctx.arc(520, 60, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.arc(512, 54, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(528, 68, 4, 0, Math.PI * 2); ctx.fill();
  // extra star (right panel only)
  if (has(d, 'star-extra')) star(ctx, 470, 110, 7, '#ffffff');
  bulbString(ctx, PANEL_W, 34, 12, ['#ff5a5a', '#ffd23c', '#4ecb71', '#4aa8ff']);
  // ground
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(0, 320, PANEL_W, 140);
  ctx.fillStyle = '#5a4030';
  for (let i = 0; i < 8; i++) ctx.fillRect(i * 78, 330 + (i % 2) * 40, 60, 8);
  // stalls
  stall(ctx, 30, 180, 150, 140, '#d23c2e', '#fff3e0', '#ff8c42');
  stall(ctx, 225, 190, 150, 130, has(d, 'awning-mid') ? '#8e44ad' : '#0e8a7b', '#fff3e0', '#7bc96f');
  stall(ctx, 420, 180, 150, 140, '#e0a800', '#fff3e0', '#e05252');
  // stall 2 sign
  ctx.fillStyle = '#fff3e0';
  ctx.fillRect(255, 216, 90, 26);
  ctx.fillStyle = '#3a2a18';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(has(d, 'sign-text') ? 'SOTO' : 'SATE', 300, 235);
  ctx.textAlign = 'left';
  // chilis on stall 1
  const chiliN = has(d, 'chili-count') ? 2 : 3;
  for (let i = 0; i < chiliN; i++) {
    ctx.fillStyle = '#d23c2e';
    ctx.beginPath();
    ctx.ellipse(58 + i * 16, 246, 5, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // lanterns
  lantern(ctx, 180, 90, 16, '#d23c2e', true);
  lantern(ctx, 300, 70, 18, has(d, 'lantern-mid') ? '#0e8a7b' : '#e0a800', true);
  lantern(ctx, 420, 90, 16, '#d23c2e', true);
  // balloons
  const bx = 90, by = 92;
  ctx.strokeStyle = '#cfd8dc';
  ctx.lineWidth = 1.5;
  for (const [ox, col] of [[-18, '#e05252'], [0, '#4aa8ff'], [18, '#ffd23c']]) {
    if (ox === 0 && has(d, 'balloon-missing')) continue;
    ctx.beginPath(); ctx.moveTo(bx + ox, by + 14); ctx.lineTo(bx, by + 58); ctx.stroke();
  }
  for (const [ox, col] of [[-18, '#e05252'], [0, '#4aa8ff'], [18, '#ffd23c']]) {
    if (ox === 0 && has(d, 'balloon-missing')) continue;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(bx + ox, by, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
  }
  // food cart
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(452, 330, 96, 44);
  ctx.fillStyle = '#a06a35';
  ctx.fillRect(452, 330, 96, 8);
  ctx.fillStyle = '#ffd23c';
  ctx.beginPath(); ctx.arc(478, 352, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e05252';
  ctx.beginPath(); ctx.arc(500, 352, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7bc96f';
  ctx.beginPath(); ctx.arc(522, 352, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5b3a1e';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(452, 344); ctx.lineTo(436, 330); ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(470, 380, 9, 0, Math.PI * 2); ctx.fill();
  if (!has(d, 'cart-wheel')) {
    ctx.beginPath(); ctx.arc(530, 380, 9, 0, Math.PI * 2); ctx.fill();
  }
  // cat sitting by stall 1 (light grey so it reads on the dark ground)
  ctx.fillStyle = '#7a7a7a';
  ctx.beginPath(); ctx.ellipse(140, 392, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(140, 372, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(130, 364); ctx.lineTo(132, 352); ctx.lineTo(138, 363); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(144, 363); ctx.lineTo(150, 352); ctx.lineTo(152, 364); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7a7a7a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(158, 396); ctx.quadraticCurveTo(172, 384, 166, 368); ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Scene 2 — Taman Kota (city park at dusk)                            */
/* ------------------------------------------------------------------ */
function drawTaman(ctx, d) {
  skyGradient(ctx, [[0, '#ff9a5c'], [0.6, '#ffc98a'], [1, '#ffe9c4']], 300);
  // sun (with / without rays)
  ctx.fillStyle = '#ffdf6b';
  ctx.beginPath(); ctx.arc(500, 90, 30, 0, Math.PI * 2); ctx.fill();
  if (!has(d, 'sun-rays')) {
    ctx.strokeStyle = '#ffdf6b';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      ctx.beginPath();
      ctx.moveTo(500 + Math.cos(a) * 36, 90 + Math.sin(a) * 36);
      ctx.lineTo(500 + Math.cos(a) * 48, 90 + Math.sin(a) * 48);
      ctx.stroke();
    }
  }
  // cloud
  if (!has(d, 'cloud-missing')) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(150, 70, 22, 0, Math.PI * 2);
    ctx.arc(172, 62, 18, 0, Math.PI * 2);
    ctx.arc(128, 64, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  // birds
  bird(ctx, 150, 120, 1, '#4a3a28');
  if (!has(d, 'bird-missing')) bird(ctx, 220, 100, 1, '#4a3a28');
  bird(ctx, 300, 130, 0.9, '#4a3a28');
  // grass
  ctx.fillStyle = '#4e9b4e';
  ctx.fillRect(0, 300, PANEL_W, 160);
  ctx.fillStyle = '#458a45';
  ctx.fillRect(0, 300, PANEL_W, 10);
  // path
  ctx.fillStyle = '#d9c39a';
  ctx.beginPath();
  ctx.moveTo(240, 460); ctx.lineTo(300, 300); ctx.lineTo(340, 300); ctx.lineTo(400, 460);
  ctx.closePath(); ctx.fill();
  // trees
  tree(ctx, 80, 320, 1.2, '#2e7d32');
  tree(ctx, 520, 320, 1.0, '#388e3c');
  // apple on tree 1
  if (!has(d, 'apple-missing')) {
    ctx.fillStyle = '#d23c2e';
    ctx.beginPath(); ctx.arc(95, 240, 7, 0, Math.PI * 2); ctx.fill();
  }
  // pond
  ctx.fillStyle = '#3d8fb5';
  ctx.beginPath(); ctx.ellipse(380, 385, 120, 38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(380, 385, 96, 26, 0, 0.2, Math.PI * 0.8); ctx.stroke();
  // lily pads
  const lilyN = has(d, 'lily-extra') ? 4 : 3;
  const lilyX = [330, 380, 425, 455];
  for (let i = 0; i < lilyN; i++) {
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath(); ctx.ellipse(lilyX[i], 392, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
  // ducks
  const duckX = [340, 390, 430];
  for (let i = 0; i < 3; i++) {
    if (i === 1 && has(d, 'duck-count')) continue;
    const dx = duckX[i];
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(dx, 378, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(dx + 10, 372, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff9a3c';
    ctx.beginPath(); ctx.moveTo(dx + 15, 372); ctx.lineTo(dx + 21, 374); ctx.lineTo(dx + 15, 376); ctx.closePath(); ctx.fill();
  }
  // bench
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(190, 330, 90, 8);
  const slats = has(d, 'bench-slat') ? 3 : 4;
  for (let i = 0; i < slats; i++) {
    ctx.fillRect(190, 306 + i * 8, 90, 5);
  }
  ctx.fillRect(196, 338, 6, 22);
  ctx.fillRect(268, 338, 6, 22);
  // lamp post
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(278, 240, 5, 70);
  ctx.beginPath(); ctx.arc(280, 236, 10, 0, Math.PI * 2); ctx.fill();
  if (!has(d, 'lamp-off')) {
    const g = ctx.createRadialGradient(280, 236, 2, 280, 236, 34);
    g.addColorStop(0, 'rgba(255, 240, 170, 0.7)');
    g.addColorStop(1, 'rgba(255, 240, 170, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(280, 236, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath(); ctx.arc(280, 236, 7, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath(); ctx.arc(280, 236, 7, 0, Math.PI * 2); ctx.fill();
  }
  // flowers
  const flowerCols = ['#e05252', '#ffd23c', '#4aa8ff', '#e05252', '#ff8ac2'];
  for (let i = 0; i < 5; i++) {
    const fx = 60 + i * 40;
    let col = flowerCols[i];
    if (i === 0 && has(d, 'flower-red')) col = '#ffd23c';
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(fx, 448); ctx.lineTo(fx, 430); ctx.stroke();
    ctx.fillStyle = col;
    for (let p = 0; p < 5; p++) {
      const a = (Math.PI * 2 / 5) * p;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(a) * 6, 426 + Math.sin(a) * 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffdf6b';
    ctx.beginPath(); ctx.arc(fx, 426, 4, 0, Math.PI * 2); ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Scene 3 — Pelabuhan Fajar (harbor at dawn)                          */
/* ------------------------------------------------------------------ */
function drawPelabuhan(ctx, d) {
  skyGradient(ctx, [[0, '#ffd9a0'], [0.7, '#ffeecf'], [1, '#fff6e0']], 260);
  // rising sun
  ctx.fillStyle = '#ff9a3c';
  ctx.beginPath(); ctx.arc(110, 120, 28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 154, 60, 0.25)';
  ctx.beginPath(); ctx.arc(110, 120, 44, 0, Math.PI * 2); ctx.fill();
  // cloud(s)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(400, 60, 20, 0, Math.PI * 2);
  ctx.arc(420, 52, 16, 0, Math.PI * 2);
  ctx.arc(380, 54, 14, 0, Math.PI * 2);
  ctx.fill();
  if (has(d, 'cloud-extra')) {
    ctx.beginPath();
    ctx.arc(320, 46, 14, 0, Math.PI * 2);
    ctx.arc(334, 40, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  // gulls
  bird(ctx, 200, 90, 1, '#4a3a28');
  if (!has(d, 'gull-missing')) bird(ctx, 260, 70, 1, '#4a3a28');
  bird(ctx, 330, 100, 0.9, '#4a3a28');
  // sea
  ctx.fillStyle = '#2e7fa8';
  ctx.fillRect(0, 260, PANEL_W, 200);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  for (const wy of [290, 330, 380, 430]) {
    ctx.beginPath();
    for (let x = 0; x <= PANEL_W; x += 20) {
      const y = wy + Math.sin(x / 40 + wy) * 3;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // pier
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(40, 380, 180, 16);
  ctx.fillRect(56, 396, 10, 30);
  ctx.fillRect(190, 396, 10, 30);
  // crates on pier
  const crateN = has(d, 'crate-count') ? 2 : 3;
  for (let i = 0; i < crateN; i++) {
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(60 + i * 34, 352 - (i === 2 ? 26 : 0), 30, 28);
    ctx.strokeStyle = '#8a6508';
    ctx.lineWidth = 2;
    ctx.strokeRect(60 + i * 34, 352 - (i === 2 ? 26 : 0), 30, 28);
  }
  // lighthouse
  lighthouse(ctx, 480, 250, 130, '#d23c2e', '#fff3e0', !has(d, 'beam-off'));
  // lighthouse window
  ctx.fillStyle = has(d, 'window-dark') ? '#3a3a3a' : '#ffe9a8';
  ctx.fillRect(474, 150, 12, 14);
  // boats
  boat(ctx, 150, 300, 1.0, '#7a4a21', has(d, 'sail-red') ? '#d23c2e' : '#fff3e0');
  boat(ctx, 300, 340, 0.8, '#5b6b7a', '#fff3e0');
  boat(ctx, 430, 380, 0.6, '#8a5a2b', '#ffd23c');
  // flag on boat 1 mast
  if (!has(d, 'flag-missing')) {
    ctx.fillStyle = '#d23c2e';
    ctx.beginPath();
    ctx.moveTo(150, 266); ctx.lineTo(168, 271); ctx.lineTo(150, 276);
    ctx.closePath(); ctx.fill();
  }
  // buoy
  ctx.fillStyle = has(d, 'buoy-yellow') ? '#ffd23c' : '#d23c2e';
  ctx.beginPath(); ctx.arc(250, 400, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(246, 394, 8, 4);
  // jumping fish
  if (!has(d, 'fish-missing')) {
    ctx.fillStyle = '#c0c8d0';
    ctx.beginPath(); ctx.ellipse(350, 300, 12, 5, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(360, 296); ctx.lineTo(368, 290); ctx.lineTo(366, 300); ctx.closePath(); ctx.fill();
  }
  // rope coil
  if (!has(d, 'rope-missing')) {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 4;
    for (const r of [6, 11, 16]) {
      ctx.beginPath(); ctx.arc(520, 410, r, 0, Math.PI * 2); ctx.stroke();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Scene 4 — Dapur Nenek (grandma's kitchen)                           */
/* ------------------------------------------------------------------ */
function drawDapur(ctx, d) {
  // wall + floor
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(0, 0, PANEL_W, 360);
  ctx.fillStyle = '#e8d5ae';
  for (let y = 0; y < 360; y += 36) ctx.fillRect(0, y, PANEL_W, 2);
  ctx.fillStyle = '#a06a35';
  ctx.fillRect(0, 360, PANEL_W, 100);
  ctx.fillStyle = '#8b5a2b';
  for (let x = 0; x < PANEL_W; x += 60) ctx.fillRect(x, 360, 3, 100);
  // window with curtain + bird outside
  ctx.fillStyle = '#7fb5d9';
  ctx.fillRect(80, 60, 140, 120);
  ctx.fillStyle = '#bfe3f2';
  ctx.beginPath(); ctx.arc(120, 100, 22, 0, Math.PI * 2); ctx.fill();
  if (!has(d, 'window-bird')) bird(ctx, 150, 110, 1, '#4a3a28');
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(76, 56, 148, 6);
  ctx.fillRect(76, 180, 148, 6);
  ctx.fillRect(76, 56, 6, 130);
  ctx.fillRect(218, 56, 6, 130);
  // curtain
  ctx.fillStyle = has(d, 'curtain-color') ? '#4aa8ff' : '#d23c2e';
  ctx.beginPath();
  ctx.moveTo(80, 60); ctx.lineTo(110, 60); ctx.lineTo(102, 180); ctx.lineTo(80, 180);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(220, 60); ctx.lineTo(190, 60); ctx.lineTo(198, 180); ctx.lineTo(220, 180);
  ctx.closePath(); ctx.fill();
  // plant on windowsill
  ctx.fillStyle = '#c96f2e';
  ctx.beginPath();
  ctx.moveTo(168, 168); ctx.lineTo(192, 168); ctx.lineTo(188, 186); ctx.lineTo(172, 186);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(180, 168); ctx.lineTo(180, 146); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(180, 156); ctx.quadraticCurveTo(168, 148, 164, 140); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(180, 156); ctx.quadraticCurveTo(192, 148, 196, 140); ctx.stroke();
  if (!has(d, 'plant-flower')) {
    ctx.fillStyle = '#ff8ac2';
    for (let p = 0; p < 5; p++) {
      const a = (Math.PI * 2 / 5) * p;
      ctx.beginPath();
      ctx.arc(180 + Math.cos(a) * 5, 140 + Math.sin(a) * 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffdf6b';
    ctx.beginPath(); ctx.arc(180, 140, 3, 0, Math.PI * 2); ctx.fill();
  }
  // shelf with jars
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(290, 116, 180, 8);
  const jarN = has(d, 'jar-count') ? 3 : 4;
  const jarCols = ['#e05252', '#7bc96f', '#ffd23c', '#4aa8ff'];
  for (let i = 0; i < jarN; i++) {
    const jx = 300 + i * 42;
    ctx.fillStyle = jarCols[i];
    roundRect(ctx, jx, 76, 30, 40, 6);
    ctx.fill();
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(jx + 4, 70, 22, 8);
  }
  // hanging pans
  const panX = [420, 470, 520];
  for (let i = 0; i < 3; i++) {
    if (i === 1 && has(d, 'pan-count')) continue;
    const px = panX[i];
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, 60); ctx.lineTo(px, 84); ctx.stroke();
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath(); ctx.arc(px, 102, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath(); ctx.arc(px, 102, 12, 0, Math.PI * 2); ctx.fill();
  }
  // clock
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(300, 200, 26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(300, 200, 26, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(300, 200);
  if (has(d, 'clock-time')) { ctx.lineTo(300, 214); } else { ctx.lineTo(300, 184); }
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(300, 200);
  if (has(d, 'clock-time')) { ctx.lineTo(310, 206); } else { ctx.lineTo(316, 200); }
  ctx.stroke();
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath(); ctx.arc(300, 200, 3, 0, Math.PI * 2); ctx.fill();
  // stove + pots
  ctx.fillStyle = '#5b6b7a';
  ctx.fillRect(360, 300, 180, 60);
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath(); ctx.arc(410, 296, 22, 0, Math.PI); ctx.fill();
  ctx.beginPath(); ctx.arc(490, 296, 22, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#c0c8d0';
  ctx.fillRect(388, 272, 44, 24);
  ctx.fillRect(468, 272, 44, 24);
  // table with teapot + cups
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(120, 340, 200, 12);
  ctx.fillRect(130, 352, 10, 50);
  ctx.fillRect(300, 352, 10, 50);
  // teapot: round body, lid knob, spout right, C-handle left
  ctx.fillStyle = '#4aa8ff';
  ctx.beginPath(); ctx.ellipse(200, 322, 26, 16, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2f7fc9';
  ctx.fillRect(194, 300, 12, 6);
  ctx.beginPath(); ctx.arc(200, 299, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4aa8ff';
  ctx.beginPath(); ctx.moveTo(222, 316); ctx.lineTo(238, 306); ctx.lineTo(236, 320); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2f7fc9';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(174, 322, 9, Math.PI * 0.4, Math.PI * 1.6); ctx.stroke();
  // steam
  if (!has(d, 'steam-off')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(200, 302);
    ctx.quadraticCurveTo(194, 290, 200, 280);
    ctx.quadraticCurveTo(206, 270, 200, 260);
    ctx.stroke();
  }
  // cups
  ctx.fillStyle = '#e05252';
  ctx.fillRect(240, 330, 16, 12);
  ctx.fillStyle = '#ffd23c';
  ctx.fillRect(264, 330, 16, 12);
  if (has(d, 'cup-extra')) {
    ctx.fillStyle = '#7bc96f';
    ctx.fillRect(288, 330, 16, 12);
  }
  // rug
  ctx.fillStyle = '#c96f2e';
  roundRect(ctx, 240, 410, 160, 34, 8);
  ctx.fill();
  ctx.fillStyle = has(d, 'rug-stripe') ? '#7bc96f' : '#d23c2e';
  ctx.fillRect(240, 422, 160, 8);
  // cat sleeping on chair
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(460, 380, 100, 10);
  ctx.fillRect(468, 390, 8, 40);
  ctx.fillRect(544, 390, 8, 40);
  ctx.fillStyle = '#e8a33d';
  ctx.beginPath(); ctx.ellipse(505, 372, 30, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(478, 368, 11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(470, 360); ctx.lineTo(472, 350); ctx.lineTo(477, 359); ctx.closePath(); ctx.fill();
  if (has(d, 'cat-tail')) {
    // tail stretched out
    ctx.strokeStyle = '#e8a33d';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(532, 374); ctx.lineTo(556, 380); ctx.stroke();
  } else {
    // tail curled around body
    ctx.strokeStyle = '#e8a33d';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(520, 376, 12, 0.3, Math.PI * 1.2); ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/* Scene table                                                         */
/* ------------------------------------------------------------------ */
export const SCENES = [
  {
    id: 'pasar', name: 'Pasar Malam', sub: 'Level 1 — 8 perbedaan', timeLimit: 120,
    draw: drawPasar,
    diffs: [
      { id: 'moon-color', x: 520, y: 60, r: 28, label: 'Warna bulan' },
      { id: 'lantern-mid', x: 300, y: 70, r: 20, label: 'Warna lampion tengah' },
      { id: 'balloon-missing', x: 90, y: 92, r: 24, label: 'Balon yang hilang' },
      { id: 'awning-mid', x: 300, y: 200, r: 30, label: 'Warna atap kios' },
      { id: 'star-extra', x: 470, y: 110, r: 10, label: 'Bintang tambahan' },
      { id: 'cart-wheel', x: 530, y: 380, r: 16, label: 'Roda gerobak' },
      { id: 'sign-text', x: 300, y: 228, r: 22, label: 'Tulisan papan kios' },
      { id: 'chili-count', x: 66, y: 246, r: 18, label: 'Jumlah cabai' },
    ],
  },
  {
    id: 'taman', name: 'Taman Kota', sub: 'Level 2 — 9 perbedaan', timeLimit: 120,
    draw: drawTaman,
    diffs: [
      { id: 'duck-count', x: 390, y: 380, r: 18, label: 'Bebek di kolam' },
      { id: 'lamp-off', x: 280, y: 236, r: 22, label: 'Lampu taman' },
      { id: 'flower-red', x: 60, y: 428, r: 14, label: 'Warna bunga' },
      { id: 'bird-missing', x: 220, y: 100, r: 14, label: 'Burung di langit' },
      { id: 'bench-slat', x: 235, y: 320, r: 24, label: 'Papan bangku' },
      { id: 'apple-missing', x: 95, y: 240, r: 12, label: 'Apel di pohon' },
      { id: 'cloud-missing', x: 150, y: 66, r: 26, label: 'Awan' },
      { id: 'lily-extra', x: 455, y: 392, r: 14, label: 'Daun teratai' },
      { id: 'sun-rays', x: 500, y: 90, r: 34, label: 'Sinar matahari' },
    ],
  },
  {
    id: 'pelabuhan', name: 'Pelabuhan Fajar', sub: 'Level 3 — 10 perbedaan', timeLimit: 150,
    draw: drawPelabuhan,
    diffs: [
      { id: 'beam-off', x: 470, y: 110, r: 26, label: 'Sinar mercusuar' },
      { id: 'sail-red', x: 160, y: 282, r: 24, label: 'Warna layar perahu' },
      { id: 'gull-missing', x: 260, y: 70, r: 14, label: 'Burung camar' },
      { id: 'crate-count', x: 94, y: 366, r: 22, label: 'Jumlah peti' },
      { id: 'flag-missing', x: 158, y: 270, r: 12, label: 'Bendera perahu' },
      { id: 'buoy-yellow', x: 250, y: 400, r: 14, label: 'Warna pelampung' },
      { id: 'window-dark', x: 480, y: 157, r: 10, label: 'Jendela mercusuar' },
      { id: 'rope-missing', x: 520, y: 410, r: 16, label: 'Gulungan tali' },
      { id: 'fish-missing', x: 352, y: 298, r: 14, label: 'Ikan melompat' },
      { id: 'cloud-extra', x: 327, y: 44, r: 20, label: 'Awan tambahan' },
    ],
  },
  {
    id: 'dapur', name: 'Dapur Nenek', sub: 'Level 4 — 10 perbedaan', timeLimit: 150,
    draw: drawDapur,
    diffs: [
      { id: 'clock-time', x: 300, y: 200, r: 28, label: 'Jarum jam dinding' },
      { id: 'cat-tail', x: 520, y: 376, r: 24, label: 'Ekor kucing' },
      { id: 'jar-count', x: 342, y: 96, r: 24, label: 'Jumlah toples' },
      { id: 'plant-flower', x: 180, y: 140, r: 14, label: 'Bunga di pot' },
      { id: 'steam-off', x: 200, y: 282, r: 18, label: 'Uap teko' },
      { id: 'pan-count', x: 470, y: 102, r: 20, label: 'Jumlah panci gantung' },
      { id: 'curtain-color', x: 95, y: 120, r: 26, label: 'Warna gorden' },
      { id: 'rug-stripe', x: 320, y: 426, r: 24, label: 'Garis karpet' },
      { id: 'cup-extra', x: 296, y: 336, r: 14, label: 'Cangkir tambahan' },
      { id: 'window-bird', x: 150, y: 110, r: 12, label: 'Burung di jendela' },
    ],
  },
];

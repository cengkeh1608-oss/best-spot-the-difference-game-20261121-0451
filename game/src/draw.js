// draw.js — shared painters + deterministic RNG for the spot-the-difference panels.
// Every scene draws through these helpers so the left and right panels are
// pixel-identical except for the differences a scene deliberately applies.

/** Mulberry32: a tiny seeded RNG. Same seed => same sequence, every run. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Round-rect path helper (works on every canvas). */
export function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

/** A five-point star centred at (cx, cy) with outer radius r. */
export function star(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** A simple bird silhouette (two arcs) at (x, y), scaled by s. */
export function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, y);
  ctx.quadraticCurveTo(x - 4 * s, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x + 4 * s, y - 6 * s, x + 9 * s, y);
  ctx.stroke();
}

/** A paper lantern: body + top/bottom caps + tassel. */
export function lantern(ctx, x, y, r, bodyColor, glow) {
  if (glow) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.2);
    g.addColorStop(0, 'rgba(255, 214, 120, 0.55)');
    g.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.9, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 30, 20, 0.7)';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.9 * Math.abs(Math.cos(i * 0.5)), r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(x - r * 0.35, y - r - 5, r * 0.7, 6);
  ctx.fillRect(x - r * 0.35, y + r - 1, r * 0.7, 6);
  ctx.strokeStyle = '#d23c2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r + 5);
  ctx.lineTo(x, y + r + 14);
  ctx.stroke();
}

/** A market stall: striped awning, counter, goods row. */
export function stall(ctx, x, y, w, h, awnA, awnB, goodsColor) {
  // posts
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(x + 4, y + 18, 6, h - 18);
  ctx.fillRect(x + w - 10, y + 18, 6, h - 18);
  // striped awning
  const stripes = 6;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? awnA : awnB;
    const sx = x + (w / stripes) * i;
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx + w / stripes, y);
    ctx.lineTo(sx + w / stripes - 3, y + 22);
    ctx.lineTo(sx + 3, y + 22);
    ctx.closePath();
    ctx.fill();
  }
  // counter
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(x, y + h - 26, w, 26);
  ctx.fillStyle = '#a06a35';
  ctx.fillRect(x, y + h - 26, w, 5);
  // goods: little jars / fruit
  const rng = makeRng(7);
  for (let i = 0; i < 5; i++) {
    const gx = x + 12 + i * ((w - 24) / 5) + rng() * 4;
    ctx.fillStyle = goodsColor;
    ctx.beginPath();
    ctx.arc(gx, y + h - 32, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(gx - 2, y + h - 35, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A round tree: trunk + 3 foliage circles. */
export function tree(ctx, x, y, s, leaf, trunk) {
  ctx.fillStyle = trunk || '#6b4423';
  ctx.fillRect(x - 4 * s, y - 34 * s, 8 * s, 34 * s);
  ctx.fillStyle = leaf;
  ctx.beginPath();
  ctx.arc(x, y - 44 * s, 20 * s, 0, Math.PI * 2);
  ctx.arc(x - 15 * s, y - 30 * s, 14 * s, 0, Math.PI * 2);
  ctx.arc(x + 15 * s, y - 30 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();
}

/** A simple boat hull + mast + sail on water at (x, y). */
export function boat(ctx, x, y, s, hull, sailColor) {
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 34 * s, y);
  ctx.lineTo(x + 34 * s, y);
  ctx.lineTo(x + 24 * s, y + 12 * s);
  ctx.lineTo(x - 24 * s, y + 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(x - 1.5 * s, y - 34 * s, 3 * s, 34 * s);
  ctx.fillStyle = sailColor;
  ctx.beginPath();
  ctx.moveTo(x + 2 * s, y - 32 * s);
  ctx.lineTo(x + 2 * s, y - 2 * s);
  ctx.lineTo(x + 24 * s, y - 2 * s);
  ctx.closePath();
  ctx.fill();
}

/** A lighthouse: striped tower + light room + beam. */
export function lighthouse(ctx, x, y, h, stripeA, stripeB, beamOn) {
  const w = 26;
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(x - w / 2 - 4, y - h - 16, w + 8, 8);
  ctx.fillStyle = '#ffe9a8';
  ctx.fillRect(x - w / 2, y - h - 12, w, 12);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i % 2 === 0 ? stripeA : stripeB;
    ctx.fillRect(x - w / 2, y - h + i * (h / 4), w, h / 4);
  }
  ctx.fillStyle = '#555';
  ctx.fillRect(x - w / 2 - 3, y - 4, w + 6, 5);
  if (beamOn) {
    ctx.fillStyle = 'rgba(255, 240, 170, 0.55)';
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h - 8);
    ctx.lineTo(x - 165, y - h - 46);
    ctx.lineTo(x - 165, y - h + 26);
    ctx.closePath();
    ctx.fill();
  }
}

/** Scattered stars in the sky region. */
export function stars(ctx, w, h, count, seed) {
  const rng = makeRng(seed);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * (h * 0.45);
    const r = 0.8 + rng() * 1.4;
    ctx.globalAlpha = 0.4 + rng() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** A string of small glowing bulbs across the top. */
export function bulbString(ctx, w, y, count, colors) {
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y - 14);
  ctx.quadraticCurveTo(w / 2, y + 16, w, y - 14);
  ctx.stroke();
  for (let i = 0; i < count; i++) {
    const x = (w / (count + 1)) * (i + 1);
    const sag = Math.sin((i + 1) / (count + 1) * Math.PI) * 12;
    const by = y + sag;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x, by + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 180, 0.5)';
    ctx.beginPath();
    ctx.arc(x, by + 4, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Ground shadow ellipse under an object. */
export function shadow(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// input.js — mouse + keyboard play for both panels.
// Clicking a difference on EITHER panel counts. Arrow keys move a crosshair,
// Enter/Space picks the cell under it, H asks for a hint, M toggles the
// magnifier lens, Esc closes overlays.

/**
 * Attach input handling to a canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {object} hooks - { onPick(x, y), onKey(name), onMove(x, y) }
 *   x/y are canvas CSS pixels.
 */
export function attachInput(canvas, hooks) {
  const state = {
    mouseX: -1,
    mouseY: -1,
    crossX: canvas.width / 2,
    crossY: canvas.height / 2,
    usingKeys: false,
  };

  function canvasPoint(ev) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (ev.clientX - rect.left) * scaleX,
      y: (ev.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('pointermove', (ev) => {
    const p = canvasPoint(ev);
    state.mouseX = p.x;
    state.mouseY = p.y;
    state.usingKeys = false;
    if (hooks.onMove) hooks.onMove(p.x, p.y);
  });

  canvas.addEventListener('pointerdown', (ev) => {
    const p = canvasPoint(ev);
    state.mouseX = p.x;
    state.mouseY = p.y;
    if (hooks.onPick) hooks.onPick(p.x, p.y);
  });

  canvas.addEventListener('pointerleave', () => {
    state.mouseX = -1;
    state.mouseY = -1;
  });

  window.addEventListener('keydown', (ev) => {
    const step = ev.shiftKey ? 4 : 16;
    let handled = true;
    switch (ev.key) {
      case 'ArrowLeft': state.crossX = Math.max(0, state.crossX - step); break;
      case 'ArrowRight': state.crossX = Math.min(canvas.width, state.crossX + step); break;
      case 'ArrowUp': state.crossY = Math.max(0, state.crossY - step); break;
      case 'ArrowDown': state.crossY = Math.min(canvas.height, state.crossY + step); break;
      case 'Enter':
      case ' ':
        if (hooks.onPick) hooks.onPick(state.crossX, state.crossY);
        break;
      case 'h':
      case 'H':
        if (hooks.onKey) hooks.onKey('hint');
        break;
      case 'm':
      case 'M':
        if (hooks.onKey) hooks.onKey('magnifier');
        break;
      case 'n':
      case 'N':
        if (hooks.onKey) hooks.onKey('next');
        break;
      case 'Escape':
        if (hooks.onKey) hooks.onKey('escape');
        break;
      default:
        handled = false;
    }
    if (handled) {
      state.usingKeys = true;
      ev.preventDefault();
    }
  });

  return state;
}

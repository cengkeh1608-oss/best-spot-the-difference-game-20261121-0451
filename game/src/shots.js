// shots.js — screenshot staging for the maker.
// Load game/index.html?stage=N&found=K to open scene N with the first K
// differences already found (markers visible, counter showing what remains).
// The clock is frozen in staging mode so the shot is stable.

/**
 * Read staging params from the page URL.
 * @returns {{ stage: number, found: number } | null}
 */
export function getStaging() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('stage')) return null;
  const stage = Math.max(0, parseInt(params.get('stage') || '0', 10) || 0);
  const found = Math.max(0, parseInt(params.get('found') || '0', 10) || 0);
  return { stage, found };
}

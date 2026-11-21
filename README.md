# Pasar Malam — Cari Bedanya!

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/cengkeh1608-oss/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/cengkeh1608-oss/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

A spot-the-difference game for the [make.fun](https://make.fun/c/best-spot-the-difference-game-20261121-0451) bounty "Make the best spot the difference game".

Two near-identical pictures side by side — find every difference before the
clock runs out. Four hand-drawn (procedural canvas) scenes, 37 differences
in all: a night market, a city park at dusk, a harbor at dawn, and grandma's
kitchen.

## How to play

Open `game/index.html` in a desktop browser (or serve the `game/` folder
with any static server). No network needed.

- Click a difference on the left OR the right picture.
- Found differences get a green circle on both panels; the counter shows
  how many remain.
- Wrong click: −25 points, −3 seconds. Hint (H): −50 points, rings one
  difference you haven't found yet. Magnifier (M): a zoom lens that
  follows your mouse. Arrow keys move a crosshair, Enter picks.
- Clear all differences in a level before the timer ends to move on.

## Layout

- `main.ts` — entrypoint: copies `game/` + `screenshots/` to `/output` and
  writes `dossier.json` (Node 22, stdlib only).
- `game/index.html` + `game/src/style.css` — page and look.
- `game/src/main.js` — game state, loop, scoring, timer, markers.
- `game/src/scenes.js` — the 4 scenes and their 37 differences.
- `game/src/draw.js` — shared painters + seeded RNG (both panels are
  pixel-identical except the deliberate differences).
- `game/src/input.js` — mouse + keyboard play.
- `game/src/audio.js` — synthesised WebAudio sounds (no audio files).
- `game/src/shots.js` — screenshot staging via `?stage=N&found=K`.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

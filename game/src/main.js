// Lantern Tide — entry point: canvas setup, the game loop, staged scenes.
// One clear job: wiring. All rules live in state.js, all drawing in render.js.

import { newGame } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { stageScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? 7);

let state = shot ? stageScene(shot, seed) : newGame(seed);
const ui = { handRects: [], revealRect: null };

let last = performance.now();
function frame(now) {
  render(ctx, state, ui, now - last);
  requestAnimationFrame(frame);
}

attachInput(canvas, state, ui, () => {});
requestAnimationFrame(frame);

// The screenshot harness waits for this flag before capturing.
window.__shotReady = true;

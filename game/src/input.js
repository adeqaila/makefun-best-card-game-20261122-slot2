// Lantern Tide — input: mouse and keyboard. One clear job: turn clicks and
// keys into game actions. It never draws and never owns the rules.

import { PHASES, resolveRound, witchPick } from './state.js';

export function pointIn(r, x, y) {
  return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function attachInput(canvas, state, ui, onChange) {
  function reveal() {
    if (state.phase !== PHASES.PICK || state.selected < 0) return;
    state.yourPick = state.yourHand[state.selected];
    state.witchPick = witchPick(state);
    state.selected = -1;
    state.phase = PHASES.REVEAL;
    onChange();
    setTimeout(() => { resolveRound(state); onChange(); }, 900);
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    if (state.phase === PHASES.TITLE) {
      state.phase = PHASES.PICK;
      onChange();
      return;
    }
    if (state.phase === PHASES.OVER) {
      if (x >= 490 && x <= 790 && y >= 480 && y <= 540) {
        const fresh = newGameFromState(state);
        Object.assign(state, fresh);
        onChange();
      }
      return;
    }
    if (state.phase !== PHASES.PICK) return;
    const hit = (ui.handRects || []).find((r) => pointIn(r, x, y));
    if (hit) { state.selected = hit.index; onChange(); return; }
    if (pointIn(ui.revealRect, x, y)) reveal();
  });

  window.addEventListener('keydown', (e) => {
    if (state.phase === PHASES.TITLE && (e.key === 'Enter' || e.key === ' ')) {
      state.phase = PHASES.PICK; onChange(); return;
    }
    if (state.phase === PHASES.PICK) {
      if (e.key >= '1' && e.key <= '5') {
        const i = Number(e.key) - 1;
        if (i < state.yourHand.length) { state.selected = i; onChange(); }
      } else if (e.key === 'Enter') reveal();
      else if (e.key === 'Escape') { state.selected = -1; onChange(); }
    }
  });
}

// Restart keeping the same seed family: a fresh duel, new shuffle.
import { newGame } from './state.js';
function newGameFromState(state) {
  return newGame((state.seed + 13) % 100000);
}

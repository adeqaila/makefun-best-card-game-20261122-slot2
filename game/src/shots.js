// Lantern Tide — staged screenshot scenes. One clear job: build deterministic
// states for the four required screenshots (title, mid-game table, win, loss).

import { PHASES, newGame } from './state.js';

// A mid-game table: round 4, lanterns 2–1, one clash mid-reveal.
function stagePlay(seed) {
  const state = newGame(seed);
  state.phase = PHASES.PICK;
  state.round = 4;
  state.yourLanterns = 2;
  state.witchLanterns = 1;
  // Play two quick rounds off a fixed script so the log reads like a duel.
  state.yourHand = [
    { id: 'flame-4', name: 'Flame 4', element: 'flame', power: 4, trick: null, text: 'Flame 4. Burns Gale.' },
    { id: 'tide-3', name: 'Tide 3', element: 'tide', power: 3, trick: null, text: 'Tide 3. Drowns Flame.' },
    { id: 'gale-5', name: 'Gale 5', element: 'gale', power: 5, trick: null, text: 'Gale 5. Scatters Tide.' },
    { id: 'mirror', name: 'Mirror Lantern', element: null, power: 0, trick: 'mirror', text: 'Copies the rival card.' },
    { id: 'stone-2', name: 'Stone 2', element: 'stone', power: 2, trick: null, text: 'Stone 2. Blocks all.' },
  ];
  state.witchHand = [
    { id: 'tide-2', name: 'Tide 2', element: 'tide', power: 2, trick: null, text: 'Tide 2.' },
    { id: 'flame-1', name: 'Flame 1', element: 'flame', power: 1, trick: null, text: 'Flame 1.' },
    { id: 'gale-3', name: 'Gale 3', element: 'gale', power: 3, trick: null, text: 'Gale 3.' },
    { id: 'stone-4', name: 'Stone 4', element: 'stone', power: 4, trick: null, text: 'Stone 4.' },
    { id: 'ember', name: 'Last Ember', element: 'flame', power: 3, trick: 'ember', text: 'Flame. +2 if you lost.' },
  ];
  state.log = [
    'Round 3: your Flame 5 met her Tide 2 — the river kept her lantern.',
    'Her lantern leans — the wisp flickers. Trust it, or don’t.',
  ];
  // Mid-reveal: both cards on the table, already out of the hands.
  state.yourPick = state.yourHand[2];
  state.witchPick = state.witchHand[0];
  state.yourHand = state.yourHand.filter((c) => c !== state.yourPick);
  state.witchHand = state.witchHand.filter((c) => c !== state.witchPick);
  state.selected = -1;
  state.phase = PHASES.REVEAL;
  return state;
}

export function stageScene(scene, seed = 7) {
  if (scene === 'start') return newGame(seed);
  if (scene === 'play') return stagePlay(seed);
  if (scene === 'win') {
    const s = stagePlay(seed);
    s.witchLanterns = 0; s.phase = PHASES.OVER; s.over = 'win'; s.round = 7;
    return s;
  }
  if (scene === 'loss') {
    const s = stagePlay(seed);
    s.yourLanterns = 0; s.phase = PHASES.OVER; s.over = 'loss'; s.round = 6;
    return s;
  }
  return newGame(seed);
}

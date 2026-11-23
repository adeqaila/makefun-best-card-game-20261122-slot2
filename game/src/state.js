// Lantern Tide — game state and rules: phases, the clash, the Witch's mind.
// One clear job: pure game logic. No drawing, no input handling here.

import { BEATS, HAND_SIZE, LANTERNS, SURGE_BONUS, SURGE_MARGIN } from './config.js';
import { beatenBy, buildDeck, rng, shuffle } from './deck.js';

export const PHASES = { TITLE: 'title', PICK: 'pick', REVEAL: 'reveal', OVER: 'over' };

// Effective element/power of a card in a clash (mirror copies the rival).
export function effective(card, rival) {
  if (!card) return null;
  if (card.trick === 'mirror' && rival) return { element: rival.element, power: rival.power, trick: 'mirror' };
  let power = card.power;
  return { element: card.element, power, trick: card.trick };
}

// Who wins a clash: 'you' | 'witch' | 'tie'. Reaction beats trump power;
// same element goes to the higher power; stone always ties.
export function clashWinner(a, b) {
  if (!a || !b) return 'tie';
  if (a.element === 'stone' || b.element === 'stone') return 'tie';
  if (BEATS[a.element] === b.element) return 'you';
  if (BEATS[b.element] === a.element) return 'witch';
  if (a.power > b.power) return 'you';
  if (b.power > a.power) return 'witch';
  return 'tie';
}

export function newGame(seed = 7) {
  const rand = rng(seed);
  const deck = shuffle(buildDeck(), rand);
  const witchDeck = shuffle(buildDeck(), rng(seed + 101));
  const state = {
    seed, rand,
    phase: PHASES.TITLE,
    round: 1,
    yourLanterns: LANTERNS,
    witchLanterns: LANTERNS,
    yourHand: deck.slice(0, HAND_SIZE),
    witchHand: witchDeck.slice(0, HAND_SIZE),
    yourDeck: deck.slice(HAND_SIZE),
    witchDeck: witchDeck.slice(HAND_SIZE),
    yourPick: null,
    witchPick: null,
    witchLean: null, // telegraphed element hint (75% honest)
    yourLastElement: null,
    witchLastElement: null,
    lastWinner: null,
    lastMargin: 0,
    surge: false,
    log: ['The river is still. Choose a lantern card to reveal.'],
    selected: -1,
    over: null,
  };
  telegraph(state);
  return state;
}

export function drawUp(state, who) {
  const hand = who === 'you' ? state.yourHand : state.witchHand;
  const deck = who === 'you' ? state.yourDeck : state.witchDeck;
  while (hand.length < HAND_SIZE && deck.length) hand.push(deck.shift());
}

// The Witch's telegraph: a coloured wisp above her hand hinting at her lean.
// She leans toward the element that beats your most-played element; the
// wisp is honest 3 times in 4, and lies (shows another element) otherwise.
export function telegraph(state) {
  const counts = {};
  for (const c of state.yourHand) counts[c.element] = (counts[c.element] || 0) + 1;
  const fav = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'flame';
  const counter = beatenBy(fav) ?? 'flame';
  const honest = state.rand() < 0.75;
  if (honest) { state.witchLean = counter; return; }
  const others = ['flame', 'tide', 'gale', 'stone'].filter((e) => e !== counter);
  state.witchLean = others[Math.floor(state.rand() * others.length)];
}

// The Witch picks: usually the telegraphed counter, sometimes a trick or a
// high card when she is behind; she holds her tricks for losing rounds.
export function witchPick(state) {
  const hand = state.witchHand;
  const trick = hand.find((c) => c.trick === 'mirror' || c.trick === 'anchor');
  if (state.witchLanterns === 1 && trick) return trick;
  if (state.witchLanterns < state.yourLanterns && state.rand() < 0.3) {
    const big = hand.filter((c) => !c.trick && c.power >= 4).sort((a, b) => b.power - a.power)[0];
    if (big) return big;
  }
  const lean = hand.filter((c) => c.element === state.witchLean);
  if (lean.length && state.rand() < 0.8) return lean.sort((a, b) => b.power - a.power)[0];
  return hand[Math.floor(state.rand() * hand.length)];
}

// Resolve one revealed round. Returns a short summary line for the log.
export function resolveRound(state) {
  const you = effective(state.yourPick, state.witchPick);
  const witch = effective(state.witchPick, state.yourPick);
  let yourPower = you.power;
  let witchPower = witch.power;
  let surge = false;
  if (state.yourLastElement && you.element === state.yourLastElement) { yourPower += SURGE_BONUS; surge = true; }
  if (state.witchLastElement && witch.element === state.witchLastElement) witchPower += SURGE_BONUS;
  if (state.yourPick.trick === 'ember' && state.lastWinner === 'witch') yourPower += 2;

  const winner = clashWinner({ ...you, power: yourPower }, { ...witch, power: witchPower });
  const margin = Math.abs(yourPower - witchPower);
  let doused = 0;
  let line = '';
  if (winner === 'you') {
    doused = margin >= SURGE_MARGIN ? 2 : 1;
    state.witchLanterns = Math.max(0, state.witchLanterns - doused);
    line = `Your ${you.element} ${yourPower} beats her ${witch.element} ${witchPower} — a rival lantern goes dark${doused === 2 ? ' (surge! two go dark)' : ''}.`;
    if (state.yourPick.trick === 'gust') { drawUp(state, 'you'); drawUp(state, 'you'); line += ' Sudden Gust draws 2.'; }
  } else if (winner === 'witch') {
    doused = margin >= SURGE_MARGIN ? 2 : 1;
    state.yourLanterns = Math.max(0, state.yourLanterns - doused);
    line = `Her ${witch.element} ${witchPower} beats your ${you.element} ${yourPower} — one of your lanterns goes dark${doused === 2 ? ' (surge! two go dark)' : ''}.`;
  } else {
    line = `Both lanterns hold — ${you.element} ${yourPower} meets ${witch.element} ${witchPower} and neither gives way.`;
    if (state.yourPick.trick === 'anchor' || state.witchPick.trick === 'anchor') {
      if (state.yourPick.trick === 'anchor') { state.witchLanterns = Math.max(0, state.witchLanterns - 1); line += ' Your Stone Anchor still douses one of hers.'; }
      else { state.yourLanterns = Math.max(0, state.yourLanterns - 1); line += ' Her Stone Anchor still douses one of yours.'; }
    }
  }
  state.surge = surge;
  state.lastWinner = winner === 'tie' ? state.lastWinner : winner;
  state.lastMargin = margin;
  state.yourLastElement = you.element;
  state.witchLastElement = witch.element;
  state.log.push(line);
  if (state.log.length > 5) state.log.shift();

  // Discard the played cards, draw up, next round.
  state.yourHand.splice(state.yourHand.indexOf(state.yourPick), 1);
  state.witchHand.splice(state.witchHand.indexOf(state.witchPick), 1);
  drawUp(state, 'you');
  drawUp(state, 'witch');
  state.yourPick = null;
  state.witchPick = null;
  state.round += 1;
  if (state.witchLanterns === 0) { state.phase = PHASES.OVER; state.over = 'win'; }
  else if (state.yourLanterns === 0) { state.phase = PHASES.OVER; state.over = 'loss'; }
  else { state.phase = PHASES.PICK; telegraph(state); }
  return line;
}

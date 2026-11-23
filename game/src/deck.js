// Lantern Tide — the deck: 20 element cards plus 4 trick cards.
// One clear job: card data and deck construction only. No game logic here.

import { BEATS, ELEMENTS } from './config.js';

// mulberry32: small deterministic RNG so every staged scene is identical.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(deck, rand) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const TRICKS = [
  { id: 'mirror', name: 'Mirror Lantern', element: null, power: 0, trick: 'mirror',
    text: 'Copies the rival card: same element, same power.' },
  { id: 'ember', name: 'Last Ember', element: 'flame', power: 3, trick: 'ember',
    text: 'Flame. +2 power if you lost the last round.' },
  { id: 'anchor', name: 'Stone Anchor', element: 'stone', power: 0, trick: 'anchor',
    text: 'Stone. A tie still douses one rival lantern.' },
  { id: 'gust', name: 'Sudden Gust', element: 'gale', power: 2, trick: 'gust',
    text: 'Gale. If you win the clash, draw 2 cards.' },
];

export function buildDeck() {
  const deck = [];
  for (const el of Object.keys(ELEMENTS)) {
    for (let p = 1; p <= 5; p++) {
      deck.push({
        id: `${el}-${p}`, name: `${ELEMENTS[el].name} ${p}`,
        element: el, power: p, trick: null,
        text: `${ELEMENTS[el].name} ${p}. ${ELEMENTS[el].verb} ${ELEMENTS[BEATS[el]] ? ELEMENTS[BEATS[el]].name : 'nothing'} — and is ${el === 'stone' ? 'blocked by nothing' : 'beaten by ' + ELEMENTS[Object.keys(BEATS).find((k) => BEATS[k] === el)].name}.`,
      });
    }
  }
  for (const t of TRICKS) deck.push({ ...t });
  return deck;
}

// The element that beats `el`, or null when nothing beats it (stone).
export function beatenBy(el) {
  return Object.keys(BEATS).find((k) => BEATS[k] === el) ?? null;
}

// Lantern Tide — configuration: table, elements, and the reaction cycle.
// One clear job: every tunable number and colour lives here.

export const VIEW = { w: 1280, h: 800 };

export const ELEMENTS = {
  flame: { name: 'Flame', color: '#ff5a2a', dark: '#8f1d00', light: '#ffb03a', glyph: '▲', verb: 'burns' },
  tide: { name: 'Tide', color: '#2a9df4', dark: '#0b3d6e', light: '#7fd0ff', glyph: '●', verb: 'drowns' },
  gale: { name: 'Gale', color: '#2ee6a8', dark: '#075e43', light: '#9ff5d6', glyph: '◆', verb: 'scatters' },
  stone: { name: 'Stone', color: '#c9a227', dark: '#5c4a08', light: '#f2dc7a', glyph: '■', verb: 'blocks' },
};

// Reaction cycle: flame beats gale, gale beats tide, tide beats flame.
// Stone beats nothing and loses to nothing: it blocks the clash.
export const BEATS = { flame: 'gale', gale: 'tide', tide: 'flame', stone: null };

export const LANTERNS = 3; // lanterns each side; lose them all and the duel is lost
export const HAND_SIZE = 5;
export const SURGE_BONUS = 2; // same element twice in a row
export const SURGE_MARGIN = 3; // power gap that douses a second lantern

export const COLORS = {
  night: '#0a1226',
  river: '#10233f',
  table: '#122b4d',
  gold: '#f2c14e',
  cream: '#f7ead0',
  ink: '#1a1a22',
  muted: '#8fa3bf',
  win: '#ffd76a',
  lose: '#7d8aa5',
};

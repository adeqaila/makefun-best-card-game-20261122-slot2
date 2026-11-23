// Lantern Tide — canvas rendering: the night river, the lanterns, the cards.
// One clear job: drawing only. It never changes game state.

import { COLORS, ELEMENTS, VIEW } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGlyph(ctx, el, cx, cy, s) {
  if (el === 'mirror') {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = '#e9d8ff'; ctx.fill();
    ctx.strokeStyle = '#7b4fd0'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#7b4fd0'; ctx.font = `bold ${Math.round(s)}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✦', cx, cy + 1);
    return;
  }
  const e = ELEMENTS[el];
  ctx.fillStyle = e.light;
  ctx.strokeStyle = e.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (el === 'flame') { // triangle
    ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s * 0.9, cy + s * 0.7); ctx.lineTo(cx - s * 0.9, cy + s * 0.7);
  } else if (el === 'tide') { // droplet (circle + tip)
    ctx.arc(cx, cy + s * 0.15, s * 0.75, 0, Math.PI * 2);
    ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s * 0.6, cy + s * 0.1); ctx.lineTo(cx - s * 0.6, cy + s * 0.1);
  } else if (el === 'gale') { // diamond
    ctx.moveTo(cx, cy - s); ctx.lineTo(cx + s, cy); ctx.lineTo(cx, cy + s); ctx.lineTo(cx - s, cy);
  } else { // stone: hexagon
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = cx + s * Math.cos(a), py = cy + s * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

export function drawCardBack(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = '#241a3f'; ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 34px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('✦', x + w / 2, y + h / 2);
}

export function drawCard(ctx, card, x, y, w, h, opts = {}) {
  const el = ELEMENTS[card.element ?? 'stone'];
  const sel = opts.selected ? -14 : 0;
  y += sel;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = '#fbf3dd'; ctx.fill();
  ctx.strokeStyle = opts.selected ? COLORS.gold : el.dark;
  ctx.lineWidth = opts.selected ? 4 : 2.5; ctx.stroke();
  // element band
  ctx.save();
  roundRect(ctx, x, y, w, 34, 12);
  ctx.clip();
  ctx.fillStyle = el.color; ctx.fillRect(x, y, w, 34);
  ctx.restore();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(el.name.toUpperCase(), x + 10, y + 18);
  // power bubble
  ctx.beginPath(); ctx.arc(x + w - 20, y + 20, 15, 0, Math.PI * 2);
  ctx.fillStyle = el.dark; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(String(card.power), x + w - 20, y + 21);
  // glyph (Mirror shows its own mark, not Stone's)
  drawGlyph(ctx, card.trick === 'mirror' ? 'mirror' : (card.element ?? 'stone'), x + w / 2, y + h * 0.42, 26);
  // name + text
  ctx.fillStyle = COLORS.ink; ctx.font = 'bold 14px Georgia, serif'; ctx.textAlign = 'center';
  wrapText(ctx, card.name, x + w / 2, y + h * 0.62, w - 14, 16);
  ctx.fillStyle = '#5a5346'; ctx.font = '12px Georgia, serif';
  wrapText(ctx, card.text, x + w / 2, y + h * 0.78, w - 14, 14);
  if (card.trick) {
    ctx.fillStyle = el.dark; ctx.font = 'bold 11px Georgia, serif';
    ctx.fillText('✦ TRICK ✦', x + w / 2, y + h - 12);
  }
  return { x, y, w, h };
}

export function wrapText(ctx, text, cx, y, maxW, lh) {
  const words = String(text).split(' ');
  const lines = [''];
  for (const word of words) {
    const test = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && lines[lines.length - 1]) lines.push(word);
    else lines[lines.length - 1] = test;
  }
  lines.forEach((ln, i) => ctx.fillText(ln, cx, y + i * lh));
}

function drawLanternRow(ctx, cx, y, count, lit, color) {
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * 44;
    const on = i < count;
    ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = on ? color : '#2a3350'; ctx.fill();
    ctx.strokeStyle = on ? '#fff2c0' : '#4a5578'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = on ? '#fff' : '#6b7699';
    ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(on ? '✦' : '·', x, y + 1);
    if (!on) { ctx.beginPath(); ctx.moveTo(x - 18, y - 18); ctx.lineTo(x + 18, y + 18); ctx.strokeStyle = '#4a5578'; ctx.stroke(); }
  }
}

function drawBackground(ctx, t) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  g.addColorStop(0, '#0a1226'); g.addColorStop(0.55, '#10233f'); g.addColorStop(1, '#0a1428');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // stars
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 60; i++) {
    const x = (i * 211) % VIEW.w, y = (i * 97) % 240;
    ctx.globalAlpha = 0.25 + ((i * 13) % 10) / 16;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
  // river band
  ctx.fillStyle = 'rgba(42,157,244,0.10)';
  ctx.fillRect(0, 330, VIEW.w, 130);
  ctx.strokeStyle = 'rgba(127,208,255,0.25)'; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    for (let x = 0; x <= VIEW.w; x += 40) ctx.lineTo(x, 360 + k * 40 + Math.sin(x / 90 + t / 900 + k) * 5);
    ctx.stroke();
  }
  // vignette
  const v = ctx.createRadialGradient(640, 400, 300, 640, 400, 760);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function drawPortrait(ctx, x, y, letter, color, label, sub) {
  ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = '#fff2c0'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(letter, x, y + 1);
  ctx.fillStyle = COLORS.cream; ctx.font = 'bold 22px Georgia, serif'; ctx.textAlign = 'left';
  ctx.fillText(label, x + 48, y - 8);
  ctx.fillStyle = COLORS.muted; ctx.font = '14px Georgia, serif';
  ctx.fillText(sub, x + 48, y + 16);
}

export function render(ctx, state, ui, t) {
  drawBackground(ctx, t);
  if (state.phase === 'title') return renderTitle(ctx, state);
  if (state.phase === 'over') { renderTable(ctx, state, ui, t); return renderOver(ctx, state); }
  renderTable(ctx, state, ui, t);
}

function renderTitle(ctx, state) {
  ctx.fillStyle = COLORS.gold; ctx.font = 'bold 84px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('LANTERN TIDE', 640, 190);
  ctx.fillStyle = COLORS.cream; ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel of lanterns on the night river', 640, 240);
  // reaction cycle diagram
  const items = [['flame', 440], ['gale', 600], ['tide', 760]];
  ctx.font = 'bold 20px Georgia, serif';
  for (const [el, x] of items) {
    drawGlyph(ctx, el, x, 330, 22);
    ctx.fillStyle = ELEMENTS[el].light;
    ctx.fillText(ELEMENTS[el].name, x, 380);
  }
  ctx.fillStyle = COLORS.muted; ctx.font = '18px Georgia, serif';
  ctx.fillText('Flame burns Gale · Gale scatters Tide · Tide drowns Flame · Stone blocks all', 640, 425);
  ctx.fillStyle = COLORS.cream; ctx.font = '20px Georgia, serif';
  ctx.fillText('Pick a card. She picks one too. Both are revealed at once —', 640, 480);
  ctx.fillText('and her lantern leans toward what she will play. Read it. Counter it.', 640, 510);
  ctx.fillStyle = '#241a3f';
  roundRect(ctx, 490, 560, 300, 64, 12); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = COLORS.gold; ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('✦  BEGIN THE DUEL  ✦', 640, 593);
  ctx.fillStyle = COLORS.muted; ctx.font = '15px Georgia, serif';
  ctx.fillText('First to douse all three rival lanterns wins · Click a card, then Reveal', 640, 660);
}

function renderTable(ctx, state, ui, t) {
  // Witch bar
  drawPortrait(ctx, 70, 52, 'W', '#5b2a6e', 'The River Witch', 'Keeper of the dark water');
  drawLanternRow(ctx, 1050, 40, state.witchLanterns, true, '#c77dff');
  ctx.fillStyle = COLORS.cream; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'right';
  ctx.fillText('HER LANTERNS', 1050, 70);
  // telegraph wisp
  const lean = ELEMENTS[state.witchLean];
  ctx.fillStyle = lean.light; ctx.font = 'bold 16px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(`Her lantern leans ${lean.name} ${lean.glyph}`, 640, 40);
  ctx.fillStyle = COLORS.muted; ctx.font = '13px Georgia, serif';
  ctx.fillText('her wisp is honest three times in four — read it, then doubt it', 640, 62);
  // witch hand (face down)
  for (let i = 0; i < state.witchHand.length; i++) drawCardBack(ctx, 470 + i * 62, 84, 54, 76);
  ctx.fillStyle = COLORS.muted; ctx.font = '14px Georgia, serif'; ctx.textAlign = 'left';
  ctx.fillText(`${state.witchHand.length} cards`, 790, 125);

  // clash zone
  ctx.strokeStyle = 'rgba(242,193,78,0.35)'; ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  roundRect(ctx, 380, 200, 520, 190, 14); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = COLORS.muted; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(`ROUND ${state.round}`, 640, 222);
  if (state.yourPick && state.witchPick) {
    // Show what each card counts as in the clash (Mirror copies the rival).
    const yourShown = { ...state.yourPick, ...(state.yourPick.trick === 'mirror' ? { element: state.witchPick.element, power: state.witchPick.power } : {}) };
    const witchShown = { ...state.witchPick, ...(state.witchPick.trick === 'mirror' ? { element: state.yourPick.element, power: state.yourPick.power } : {}) };
    drawCard(ctx, yourShown, 420, 238, 150, 140);
    drawCard(ctx, witchShown, 710, 238, 150, 140);
    ctx.fillStyle = COLORS.gold; ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText('VS', 640, 310);
    if (state.surge) { ctx.fillStyle = COLORS.win; ctx.font = 'bold 16px Georgia, serif'; ctx.fillText('✦ SURGE — same element twice ✦', 640, 368); }
  } else {
    ctx.fillStyle = COLORS.muted; ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText(state.phase === 'pick' ? 'Choose a card from your hand below' : 'The lanterns are revealed…', 640, 300);
  }

  // log
  ctx.textAlign = 'left'; ctx.font = '15px Georgia, serif';
  state.log.forEach((line, i) => {
    ctx.fillStyle = i === state.log.length - 1 ? COLORS.cream : COLORS.muted;
    ctx.fillText('› ' + line, 24, 430 + i * 22);
  });

  // player bar
  drawPortrait(ctx, 70, 740, 'Y', '#b8860b', 'You', 'Keeper of the Lanterns');
  drawLanternRow(ctx, 1050, 728, state.yourLanterns, true, COLORS.gold);
  ctx.fillStyle = COLORS.cream; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'right';
  ctx.fillText('YOUR LANTERNS', 1050, 758);
  // hand
  const cw = 150, ch = 190, gap = 14;
  const total = state.yourHand.length * cw + (state.yourHand.length - 1) * gap;
  const x0 = (VIEW.w - total) / 2;
  ui.handRects = state.yourHand.map((card, i) => {
    const r = drawCard(ctx, card, x0 + i * (cw + gap), 520, cw, ch, { selected: state.selected === i });
    return { ...r, index: i };
  });
  // reveal button
  const canReveal = state.phase === 'pick' && state.selected >= 0;
  ctx.save();
  roundRect(ctx, 1060, 560, 180, 56, 12);
  ctx.fillStyle = canReveal ? COLORS.gold : '#3a4157'; ctx.fill();
  ctx.strokeStyle = canReveal ? '#fff2c0' : '#555f7d'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = canReveal ? '#241a00' : '#8a93ad'; ctx.font = 'bold 22px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('REVEAL ✦', 1150, 595);
  ctx.restore();
  ui.revealRect = { x: 1060, y: 560, w: 180, h: 56 };
}

function renderOver(ctx, state) {
  const win = state.over === 'win';
  ctx.fillStyle = 'rgba(5,8,20,0.72)'; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  if (win) {
    for (let i = 0; i < 40; i++) {
      const x = (i * 197) % VIEW.w, y = 120 + ((i * 89) % 420);
      ctx.fillStyle = ['#ffd76a', '#ff5a2a', '#2ee6a8', '#2a9df4'][i % 4];
      ctx.beginPath(); ctx.arc(x, y, 3 + (i % 3), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.fillStyle = win ? COLORS.win : COLORS.lose;
  ctx.font = 'bold 72px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText(win ? 'THE RIVER IS YOURS' : 'THE RIVER KEEPS ITS SECRET', 640, 330);
  ctx.fillStyle = COLORS.cream; ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText(win ? 'All three of her lanterns are dark. The festival is yours.' : 'Your lanterns are dark. The Witch keeps the river tonight.', 640, 385);
  ctx.fillStyle = COLORS.muted; ctx.font = '19px Georgia, serif';
  ctx.fillText(`Duel lasted ${state.round - 1} rounds · ${state.witchLanterns === 0 ? 'her lanterns doused' : 'your lanterns doused'}`, 640, 430);
  ctx.fillStyle = '#241a3f';
  roundRect(ctx, 490, 480, 300, 60, 12); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = COLORS.gold; ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('↻  PLAY AGAIN', 640, 518);
}

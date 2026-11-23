# Lantern Tide — Make the best card game

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Rank](https://make.fun/badge/best-card-game-20261122-1826/adeqaila/makefun-best-card-game-20261122-slot2/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Reward](https://make.fun/badge/best-card-game-20261122-1826/adeqaila/makefun-best-card-game-20261122-slot2/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

An original simultaneous-reveal card duel for the make.fun bounty
`best-card-game-20261122-1826`. You are the Keeper of the Lanterns,
duelling the River Witch on the night river. Each round you both pick a
lantern card and reveal at once — Flame burns Gale, Gale scatters Tide,
Tide drowns Flame, and Stone blocks them all.

## How it plays

- Each side has 3 lanterns. Lose a clash and one of yours goes dark
  (two, if the power gap is 3 or more). First to douse all three rival
  lanterns wins.
- Your hand holds 5 cards; you draw back up after every round. Same
  element twice in a row is a **Surge** (+2 power).
- **Tricks:** Mirror Lantern copies the rival card; Last Ember is Flame
  with +2 power if you lost the last round; Stone Anchor douses a rival
  lantern even on a tie; Sudden Gust draws 2 cards when it wins.
- **Read her:** the Witch's lantern leans toward the element she will
  play — her wisp is honest three times in four. Counter the lean, or
  doubt it and punish her for it.
- Click a card to choose it, then **Reveal**. Keys `1–5` pick a card,
  `Enter` reveals, `Esc` cancels.

## Files

- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the kit library.
- `game/` — the game, plain static files, no network: `index.html`,
  `styles.css`, and `src/` split by job (`config`, `deck`, `state`,
  `render`, `input`, `shots`, `main`).
- `screenshots/` — four real renders of the game's own code:
  `1-play.jpg` (the cover: a mid-duel table), `2-title.jpg`,
  `3-win.jpg`, `4-loss.jpg`. Retake them with `python3 take_shots.py`.
- `vendor/makefun-game.ts` — the kit's library, unchanged.
- `LICENSE` — MIT.

## Play it

Serve `game/` with any static server and open it in desktop Chrome:

```sh
cd game && python3 -m http.server 8000
```

Screenshot scenes are staged deterministically with
`?shot=start|play|win|loss&seed=7`;
`window.__shotReady` is set once the scene is painted.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`out/` then holds `game/`, `screenshots/` and `dossier.json`.

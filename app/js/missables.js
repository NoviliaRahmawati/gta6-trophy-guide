// Missables page: every flagged trophy with its exact window and point of no
// return, plus the cited "what cannot be missed" watchlist (PowerPyx checked the
// launch build) and the secret trophies whose triggers are still unconfirmed.

import { h, taglet } from './util.js';
import { getState, isEarned } from './store.js';
import { isMasked, KIND_LABELS, STAGES } from './data.js';
import { selectTrophy } from './checklist.js';

const PP = 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/';

/** Things that DO expire or lock — none of them affects trophies (PowerPyx). */
const WATCHLIST = [
  ['Optional missions expire', 'Many black-icon/pink-letter optional missions disappear after a while, and hourglass quests are time-sensitive. There are 200–300+ optional tasks and 100% needs any 100, so expiries never lock a trophy.'],
  ['Kenton goes quiet', 'After Chapter 1, Kenton (This Was No Boat Accident) is temporarily unavailable. As Jason in Chapters 2–3 he texts again — calling Brian speeds it up. Every trophy-related character is back in free roam.'],
  ['Some fences disappear for good', 'A few fences become permanently unavailable, but they carry no quests and new fences unlock as you progress — Dime on the Dollar is safe.'],
  ['Story buildings lock', 'A few magazine collectibles sit in story buildings that become inaccessible; they also spawn elsewhere and no trophy needs all of them.'],
  ['Irredeemable profile is permanent', 'Criminal Profile only changes police behaviour, but Irredeemable is permanent and makes cops more aggressive — avoid it (Actions Speak Louder advice).'],
  ['Cheats disable trophies AND saving', 'Cheats unlock after the story — exactly when you mop up. Keep them off your platinum save. No difficulty settings, no New Game+, no mission replay: 15 manual slots + 1 autosave.'],
];

export function mountMissables(root, trophies) {
  const state = getState();
  const flagged = trophies.filter((t) => t.missable).sort((a, b) => a.stage - b.stage || a.id - b.id);
  const left = flagged.filter((t) => !isEarned(t.id)).length;

  root.append(h('p', { class: 'page-intro wide' },
    `${flagged.length} potentially missable trophy, ${left} still open. PowerPyx checked the launch build: exactly one trophy can be missed — everything else trophy-related survives into free roam. Story-completion trophies cannot be missed.`));

  for (const t of flagged) {
    const masked = isMasked(t, state);
    const earned = isEarned(t.id);
    const open = h('button', {
      type: 'button', class: 'btn',
      onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; },
    }, 'Open guide');
    if (masked) {
      root.append(h('section', { class: `mcard ${earned ? 'earned' : ''}` },
        h('h2', {}, 'Hidden missable', taglet('secret', 'hidden-t'), taglet(`stage ${t.stage}`)),
        h('p', { class: 'why' }, 'A trophy we flag as potentially missable. The spoiler shield hides which one and why — earn it, then mark it earned to reveal the window.'),
        h('p', { class: 'meta' }, `Plan it in stage ${t.stage}: ${STAGES[t.stage - 1].title}. `, open)));
      continue;
    }
    const m = t.missableInfo;
    root.append(h('section', { class: `mcard ${earned ? 'earned' : ''}` },
      h('h2', {}, t.name, taglet(t.grade), taglet(KIND_LABELS[t.kind], t.kind),
        earned ? taglet('earned ✓', 'ok') : taglet('still open', 'missable')),
      h('p', { class: 'official-desc' }, t.description),
      h('div', { class: 'warnbox', role: 'alert' },
        h('strong', {}, '⚠ WINDOW: '), m.window,
        h('div', {}, h('b', {}, 'Point of no return: '), m.pointOfNoReturn),
        h('div', {}, h('b', {}, 'Why: '), m.why),
        h('div', {}, h('b', {}, 'Safe play: '), m.safePlay)),
      h('p', { class: 'meta' }, `Do it in stage ${t.stage}: ${STAGES[t.stage - 1].title}. `, open,
        ' Sources: ', h('a', { href: PP, target: '_blank', rel: 'noopener' }, 'PowerPyx roadmap'),
        ' (missable note + Step 1), ',
        h('a', { href: 'https://www.powerpyx.com/gta-6-all-meditation-spot-locations/', target: '_blank', rel: 'noopener' }, 'PowerPyx meditation locations'),
        ', ',
        h('a', { href: 'https://gta.guide/gta-6/guides/trophies-and-achievements', target: '_blank', rel: 'noopener' }, 'gta.guide'), '.')));
  }

  root.append(h('h2', { class: 'section-title' }, 'What cannot be missed (and what expires anyway)'),
    h('p', { class: 'page-intro wide' },
      'PowerPyx’s launch-build notes, in our words — full detail in the ',
      h('a', { href: PP, target: '_blank', rel: 'noopener' }, 'PowerPyx Trophy Guide & Roadmap'),
      ', Step 1 “missable content” note.'),
    h('div', { class: 'watchgrid' }, WATCHLIST.map(([title, body]) =>
      h('section', { class: 'watch' }, h('h3', {}, title), h('p', {}, body)))));

  const unsure = trophies.filter((t) => t.hidden && t.confidence !== 'confirmed' && !isEarned(t.id));
  if (unsure.length) {
    root.append(h('h2', { class: 'section-title' }, 'Secret trophies with unconfirmed triggers'),
      h('p', { class: 'page-intro wide' },
        'Not flagged missable — no source says they lock — but their triggers were unknown or only reported at launch. Try them early; each guide says what is verified.'),
      h('div', { class: 'unsure-row' }, unsure.map((t) => h('button', {
        type: 'button', class: 'strophy miss',
        onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; },
      }, `${t.name} · ${t.confidence === 'unknown' ? 'unknown' : 'reported'}`))));
  }
}

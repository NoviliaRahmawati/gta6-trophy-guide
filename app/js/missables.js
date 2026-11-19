// Missables page: every trophy we flag as potentially missable, with the reason,
// the roadmap stage to do it in, and its earned state. Flags are honest inferences
// from the official descriptions — the game is out today and nothing is verified yet.

import { h, taglet } from './util.js';
import { getState, isEarned } from './store.js';
import { isMasked, KIND_LABELS, STAGES } from './data.js';
import { selectTrophy } from './checklist.js';

export function mountMissables(root, trophies) {
  const state = getState();
  const flagged = trophies.filter((t) => t.missable).sort((a, b) => a.stage - b.stage || a.id - b.id);
  const left = flagged.filter((t) => !isEarned(t.id)).length;

  root.append(h('p', { class: 'page-intro wide' },
    `${flagged.length} trophies flagged potentially missable, ${left} still unearned. Launch day: no verified walkthrough exists, so each flag is an inference from the official description — a one-time scene, a unique animal, a partner window — and says so. Story-completion trophies cannot be missed. Do these before the final mission.`));

  const grid = h('div', { class: 'mgrid' });
  for (const t of flagged) {
    const masked = isMasked(t, state);
    const earned = isEarned(t.id);
    const open = h('button', {
      type: 'button', class: 'btn',
      onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; },
    }, 'Open guide');
    if (masked) {
      grid.append(h('section', { class: `mrow ${earned ? 'earned' : ''}` },
        h('h2', {}, 'Hidden missable', taglet('secret', 'hidden-t'), taglet(`stage ${t.stage}`)),
        h('p', { class: 'why' }, 'A story trophy we flagged as potentially missable. The spoiler shield hides which one and why — earn it in the game, then mark it earned to reveal the details.'),
        h('p', { class: 'meta' }, `Plan it in stage ${t.stage}: ${STAGES[t.stage - 1].title}. `, open)));
      continue;
    }
    grid.append(h('section', { class: `mrow ${earned ? 'earned' : ''}` },
      h('h2', {}, t.name, taglet(t.grade), taglet(KIND_LABELS[t.kind], t.kind),
        earned ? taglet('earned ✓', '') : taglet('still open', 'missable')),
      h('p', { class: 'why' }, t.missableReason),
      h('p', { class: 'meta' }, `Do it in stage ${t.stage}: ${STAGES[t.stage - 1].title}. `, open)));
  }
  root.append(grid);
}

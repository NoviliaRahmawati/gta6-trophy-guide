// Roadmap page: the nine ordered stages to the platinum as compact cards —
// chapter tag, live progress, one-line plan, trophy chips and the missable
// window called out in red where it applies. Masked trophies stay placeholders.

import { h, bar } from './util.js';
import { getState, isEarned } from './store.js';
import { STAGES, stageTrophies, stageProgress, isMasked } from './data.js';
import { selectTrophy } from './checklist.js';

export function mountRoadmap(root, trophies) {
  const state = getState();
  root.append(h('p', { class: 'page-intro' },
    'Our order to the platinum: story first, then free-roam cleanup, then 100%. ~200 hours, one playthrough, 4/10 (PowerPyx). No mission replay — save at each chapter boundary.'));

  const cols = [h('div', { class: 'road-col' }), h('div', { class: 'road-col' })];
  for (const stage of STAGES) {
    const prog = stageProgress(trophies, state, stage.n);
    const done = prog.earned === prog.total;
    const group = stageTrophies(trophies, stage.n);
    const missHere = group.filter((t) => t.missable && !isEarned(t.id));

    const chips = group.map((t) => {
      const masked = isMasked(t, state);
      const label = masked ? 'Hidden trophy' : t.name;
      return h('button', {
        type: 'button',
        class: `strophy ${isEarned(t.id) ? 'earned' : ''} ${masked ? 'masked' : ''} ${t.missable ? 'miss' : ''}`,
        title: masked ? 'Spoiler shield on — earn to reveal' : `Open guide (${t.grade})`,
        onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; },
      }, `${isEarned(t.id) ? '✓ ' : ''}${label}`);
    });

    cols[stage.n <= 4 ? 0 : 1].append(h('section', { class: `stage ${done ? 'done' : ''}` },
      h('div', { class: 'stage-head' },
        h('span', { class: 'stage-num' }, stage.n),
        h('h2', {}, stage.title),
        h('span', { class: 'stage-chapter' }, stage.chapter),
        bar(prog.earned, prog.total),
        h('span', { class: 'stage-count' }, `${prog.earned}/${prog.total}`)),
      h('p', { class: 'stage-blurb' }, stage.blurb),
      missHere.length ? h('p', { class: 'stage-miss' },
        `⚠ Missable window here: ${missHere.map((t) => isMasked(t, state) ? 'a hidden trophy' : t.name).join(', ')} — ${missHere[0].missableInfo.window}.`) : null,
      h('div', { class: 'stage-trophies' }, chips)));
  }
  root.append(h('div', { class: 'road-grid' }, cols));
}

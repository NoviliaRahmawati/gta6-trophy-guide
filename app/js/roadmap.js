// Roadmap page: the seven ordered stages to the platinum, each with live progress
// and its trophy chips. Masked story trophies appear as placeholders under the shield.

import { h, bar } from './util.js';
import { getState, isEarned } from './store.js';
import { STAGES, stageTrophies, stageProgress, isMasked } from './data.js';
import { selectTrophy } from './checklist.js';

export function mountRoadmap(root, trophies) {
  const state = getState();
  root.append(h('p', { class: 'page-intro' },
    'Our suggested order to the platinum, derived from the official descriptions: story first (with the one-time moments taken as they appear), contacts next, then the finale, then the map-wide cleanup and activity counters. Progress bars update as you tick trophies. Story trophies stay masked while the spoiler shield is on.'));

  for (const stage of STAGES) {
    const prog = stageProgress(trophies, state, stage.n);
    const done = prog.earned === prog.total;
    const chips = stageTrophies(trophies, stage.n).map((t) => {
      const masked = isMasked(t, state);
      const label = masked ? 'Hidden story trophy' : t.name;
      return h('button', {
        type: 'button',
        class: `strophy ${isEarned(t.id) ? 'earned' : ''} ${masked ? 'masked' : ''}`,
        title: masked ? 'Spoiler shield on — earn to reveal' : `Open guide (${t.grade})`,
        onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; },
      }, `${isEarned(t.id) ? '✓ ' : ''}${label}`);
    });
    root.append(h('section', { class: `stage ${done ? 'done' : ''}` },
      h('div', { class: 'stage-head' },
        h('span', { class: 'stage-num' }, stage.n),
        h('h2', {}, stage.title),
        bar(prog.earned, prog.total),
        h('span', { class: 'stage-count' }, `${prog.earned}/${prog.total} earned`)),
      h('p', { class: 'stage-blurb' }, stage.blurb),
      h('div', { class: 'stage-trophies' }, chips)));
  }
}

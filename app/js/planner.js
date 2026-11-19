// Next-up planner: automatic suggestions (missables first, then roadmap order)
// plus a personal queue you can reorder. Suggestions respect the spoiler shield.

import { h, taglet } from './util.js';
import { getState, isEarned, addToQueue, removeFromQueue, moveInQueue } from './store.js';
import { nextUp, isMasked } from './data.js';
import { selectTrophy } from './checklist.js';

export function mountPlanner(root, trophies) {
  const state = getState();
  const suggs = nextUp(trophies, state, 5);

  const suggPanel = h('section', { class: 'panel' },
    h('h2', {}, 'Suggested next up'),
    h('p', { class: 'page-intro' }, 'Unearned trophies ranked: potentially missable first, then roadmap stage order. Add them to your queue to plan a session.'),
    suggs.length
      ? suggs.map(({ trophy: t, reason }) => suggestion(t, reason, state))
      : h('p', { class: 'empty' }, 'Everything is earned — the platinum is yours. Leonida Legend.'));

  const queuePanel = h('section', { class: 'panel' },
    h('h2', {}, `Your queue (${state.queue.length})`),
    state.queue.length
      ? state.queue.map((id) => queueRow(trophies.find((t) => t.id === id), state)).filter(Boolean)
      : h('p', { class: 'empty' }, 'Empty. Add suggestions on the left, or open any trophy and plan from its guide.'));

  root.append(h('div', { class: 'plan-grid' }, suggPanel, queuePanel));
}

function suggestion(t, reason, state) {
  const masked = isMasked(t, state);
  const queued = state.queue.includes(t.id);
  return h('div', { class: 'sugg' },
    h('div', {},
      h('div', { class: 's-name' }, masked ? 'Hidden story trophy' : t.name, ' ',
        taglet(t.grade), t.missable ? taglet('missable?', 'missable') : null),
      h('div', { class: 's-why' }, masked ? `Stage ${t.stage} story beat — the shield hides details until earned.` : reason)),
    h('div', {},
      h('button', {
        type: 'button', class: 'btn', disabled: queued,
        onclick: () => addToQueue(t.id),
      }, queued ? 'Queued ✓' : 'Add'),
      ' ',
      h('button', {
        type: 'button', class: 'btn',
        onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; },
      }, 'Guide')));
}

function queueRow(t, state) {
  if (!t) return null;
  const masked = isMasked(t, state);
  const name = masked ? 'Hidden story trophy' : t.name;
  return h('div', { class: 'qrow' },
    h('span', { class: 'q-name' }, `${isEarned(t.id) ? '✓ ' : ''}${name}`),
    taglet(t.grade),
    h('button', { type: 'button', class: 'btn', 'aria-label': 'Move up', onclick: () => moveInQueue(t.id, -1) }, '↑'),
    h('button', { type: 'button', class: 'btn', 'aria-label': 'Move down', onclick: () => moveInQueue(t.id, 1) }, '↓'),
    h('button', { type: 'button', class: 'btn', 'aria-label': 'Open guide', onclick: () => { selectTrophy(t.id); location.hash = '#/checklist'; } }, 'Guide'),
    h('button', { type: 'button', class: 'btn danger', 'aria-label': 'Remove', onclick: () => removeFromQueue(t.id) }, '✕'));
}

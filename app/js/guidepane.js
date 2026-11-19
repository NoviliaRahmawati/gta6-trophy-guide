// The per-trophy guide pane: official text, our cited guide, steps, missable warning,
// PSN counter controls, personal notes and visible sources. Respects the spoiler shield.

import { h, bar, countLabel, taglet } from './util.js';
import { getState, isEarned, toggleEarned, setCounter, counterValue, setNote } from './store.js';
import { isMasked, KIND_LABELS, STAGES } from './data.js';

export function renderGuidePane(t) {
  if (!t) return h('aside', { class: 'pane' }, h('p', { class: 'empty' }, 'Select a trophy to open its guide.'));
  const state = getState();
  const pane = h('aside', { class: 'pane', 'aria-label': `Guide: ${t.name}` });

  if (isMasked(t, state)) {
    pane.append(
      h('div', { class: 'tags' }, taglet(t.grade, ''), taglet('story', 'story'), taglet('secret', 'hidden-t')),
      h('h2', {}, 'Hidden story trophy'),
      h('div', { class: 'spoilerbox' },
        'The spoiler shield is on. This story trophy’s name, description and guide stay hidden until you mark it earned — earn it in the game first, then tick the box below to reveal it here.'),
      h('h3', {}, 'Roadmap'),
      h('p', { class: 'guide-text' }, `Stage ${t.stage}: ${STAGES[t.stage - 1].title}.`),
      earnToggle(t),
    );
    return pane;
  }

  const tags = h('div', { class: 'tags' },
    taglet(t.grade), taglet(KIND_LABELS[t.kind], t.kind),
    t.missable ? taglet('missable?', 'missable') : null,
    t.hidden ? taglet('secret', 'hidden-t') : null);

  pane.append(tags, h('h2', {}, t.name), h('p', { class: 'official-desc' }, t.description));

  if (t.missable) {
    pane.append(h('div', { class: 'warnbox' }, h('strong', {}, 'Potentially missable. '), t.missableReason));
  }

  pane.append(h('h3', {}, 'Our guide'), h('p', { class: 'guide-text' }, t.guide));

  if (t.steps?.length) {
    pane.append(h('h3', {}, 'Suggested steps'),
      h('ol', { class: 'steps' }, t.steps.map((s) => h('li', {}, s))));
  }

  pane.append(
    h('h3', {}, 'Sources'),
    h('ul', { class: 'sources' }, t.sources.map((s) =>
      h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.label)))));

  if (t.psnTarget) pane.append(counterBox(t));

  pane.append(
    h('h3', {}, 'Your notes'),
    h('textarea', {
      'data-focus': 'note', placeholder: 'Where you found it, what worked…',
      onchange: (e) => setNote(t.id, e.target.value),
    }, state.notes[t.id] ?? ''),
    earnToggle(t),
  );
  return pane;
}

function earnToggle(t) {
  const box = h('input', {
    type: 'checkbox', 'data-focus': 'earn',
    onchange: () => toggleEarned(t.id),
  });
  box.checked = isEarned(t.id);
  return h('label', { class: 'earn-toggle' }, box,
    isEarned(t.id) ? 'Earned — untick to undo' : 'Mark as earned');
}

function counterBox(t) {
  const value = counterValue(t.id);
  const step = t.psnTarget >= 10000 ? 5000 : 1;
  const input = h('input', {
    type: 'number', min: 0, max: t.psnTarget, step, value,
    'data-focus': 'counter', 'aria-label': `Progress toward ${t.psnTarget}`,
    onchange: (e) => setCounter(t.id, e.target.value, t.psnTarget),
  });
  return h('div', { class: 'counterbox' },
    h('strong', {}, 'PSN counter '), h('span', { class: 'mini-count' }, countLabel(t, value)),
    bar(value, t.psnTarget),
    h('div', { class: 'counter-ctl' },
      h('button', { type: 'button', onclick: () => setCounter(t.id, value - step, t.psnTarget) }, `−${step.toLocaleString('en-US')}`),
      input,
      h('button', { type: 'button', onclick: () => setCounter(t.id, value + step, t.psnTarget) }, `+${step.toLocaleString('en-US')}`),
      h('span', { class: 'mini-count' }, 'reaching the target auto-marks it earned')),
  );
}

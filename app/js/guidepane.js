// The per-trophy guide pane: official text verbatim, the red missable warning
// (window, point of no return, why, safe play), PSN counter, numbered steps,
// named sources with what each supports, our guide, notes and the earn toggle.
// Order is tuned so a missable trophy shows warning + counter + steps + sources
// above the fold. Respects the spoiler shield.

import { h, bar, countLabel, taglet } from './util.js';
import { getState, isEarned, toggleEarned, setCounter, counterValue, setNote } from './store.js';
import { isMasked, KIND_LABELS, CONFIDENCE_LABELS, STAGES } from './data.js';

export function renderGuidePane(t) {
  if (!t) return h('aside', { class: 'pane' }, h('p', { class: 'empty' }, 'Select a trophy to open its guide.'));
  const state = getState();
  const pane = h('aside', { class: 'pane', 'aria-label': `Guide: ${t.name}` });

  if (isMasked(t, state)) {
    pane.append(
      h('div', { class: 'tags' }, taglet(t.grade), taglet(KIND_LABELS[t.kind], t.kind), taglet('secret', 'hidden-t')),
      h('h2', {}, 'Hidden trophy'),
      h('div', { class: 'spoilerbox' },
        'The spoiler shield is on. PlayStation hides this trophy until earned, so its name, description and guide stay masked here too. Earn it in the game, then tick the box below to reveal it.'),
      h('p', { class: 'ctx' }, `Roadmap: stage ${t.stage} — ${STAGES[t.stage - 1].title}.`),
      earnToggle(t),
    );
    return pane;
  }

  const tags = h('div', { class: 'tags' },
    taglet(t.grade), taglet(KIND_LABELS[t.kind], t.kind),
    t.missable ? taglet('missable', 'missable') : null,
    t.hidden ? taglet('secret', 'hidden-t') : null,
    taglet(`stage ${t.stage}`, 'stage-t'),
    t.confidence !== 'confirmed' ? taglet(CONFIDENCE_LABELS[t.confidence], 'unverified') : null);

  pane.append(tags, h('h2', {}, t.name), h('p', { class: 'official-desc' }, t.description));

  if (t.missable) pane.append(warnBox(t));
  if (t.psnTarget) pane.append(counterBox(t));

  if (t.steps?.length) {
    pane.append(h('h3', {}, 'Steps'),
      h('ol', { class: 'steps' }, t.steps.map((s) => h('li', {}, s))));
  }

  pane.append(h('h3', {}, `Sources (${t.sources.length})`),
    h('ul', { class: 'sources' }, t.sources.map((s) =>
      h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.label),
        s.note ? h('span', { class: 'src-note' }, ` — ${s.note}`) : null))));

  pane.append(h('h3', {}, 'Our guide'), h('p', { class: 'guide-text' }, t.guide));

  pane.append(
    h('h3', {}, 'Your notes'),
    h('textarea', {
      'data-focus': 'note', placeholder: 'Where you found it, what worked…',
      onchange: (e) => setNote(t.id, e.target.value),
    }, state.notes[t.id] ?? ''),
    earnToggle(t),
    h('p', { class: 'autosave-note' }, 'Autosaved to this browser (localStorage) on every change.'),
  );
  return pane;
}

/** The red warning: exact window, point of no return, why, and the safe play. */
function warnBox(t) {
  const m = t.missableInfo;
  return h('div', { class: 'warnbox', role: 'alert' },
    h('strong', {}, '⚠ MISSABLE — '), h('span', { class: 'warn-window' }, m.window),
    h('div', {}, h('b', {}, 'Point of no return: '), m.pointOfNoReturn),
    h('div', {}, h('b', {}, 'Why: '), m.why),
    h('div', {}, h('b', {}, 'Safe play: '), m.safePlay));
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
    h('div', { class: 'counter-top' },
      h('strong', {}, 'PSN counter'),
      h('span', { class: 'mini-count' }, countLabel(t, value)),
      t.counterLabel ? h('span', { class: 'counter-unit' }, t.counterLabel) : null),
    bar(value, t.psnTarget),
    h('div', { class: 'counter-ctl' },
      h('button', { type: 'button', onclick: () => setCounter(t.id, value - step, t.psnTarget) }, `−${step.toLocaleString('en-US')}`),
      input,
      h('button', { type: 'button', onclick: () => setCounter(t.id, value + step, t.psnTarget) }, `+${step.toLocaleString('en-US')}`),
      h('span', { class: 'mini-count' }, 'target auto-earns')),
  );
}

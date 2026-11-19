// Checklist page: search, kind/grade filter pills with live counts, hide-earned,
// and the trophy list GROUPED BY ROADMAP STAGE with headers, beside the guide pane.
// Filter state is UI state (not saved); progress lives in the store.

import { h, gradeDot, taglet, countLabel, pct } from './util.js';
import { getState, isEarned, toggleEarned, counterValue } from './store.js';
import { isMasked, KIND_LABELS, STAGES } from './data.js';
import { renderGuidePane } from './guidepane.js';

const ui = { search: '', kind: 'all', grade: 'all', hideEarned: false, selected: 28 };
let els = null;

export function selectTrophy(id) { ui.selected = id; }

export function mountChecklist(root, trophies) {
  ui.hideEarned = getState().settings.hideEarned;
  const note = h('span', { class: 'result-note' });
  const search = h('input', {
    type: 'search', placeholder: 'Search trophies…', value: ui.search, 'data-focus': 'search',
    'aria-label': 'Search trophies',
    oninput: (e) => { ui.search = e.target.value; paint(); },
  });
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Kind filter' });
  const grade = h('select', { 'aria-label': 'Grade filter', onchange: (e) => { ui.grade = e.target.value; paint(); } },
    [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']]
      .map(([v, l]) => h('option', { value: v, selected: ui.grade === v }, l)));
  const hide = h('input', { type: 'checkbox', onchange: (e) => { ui.hideEarned = e.target.checked; paint(); } });
  hide.checked = ui.hideEarned;

  const toolbar = h('div', { class: 'toolbar' }, search, chips, grade,
    h('label', { class: 'check' }, hide, 'Hide earned'), note);
  const listWrap = h('div', { class: 'tlist' });
  const paneWrap = h('div');
  root.append(toolbar, h('div', { class: 'split' }, listWrap, paneWrap));
  els = { trophies, listWrap, paneWrap, note, chips };
  paint();
}

export function updateChecklist() { if (els) paint(); }

/** Kind pills with counts of what each filter would show right now. */
function paintChips() {
  const { trophies, chips } = els;
  const state = getState();
  const defs = [
    ['all', 'All', () => true],
    ['story', 'Story', (t) => t.kind === 'story'],
    ['missable', 'Missable', (t) => t.missable],
    ['collectible', 'Collectibles', (t) => t.kind === 'collectible'],
    ['activity', 'Activities', (t) => t.kind === 'activity'],
    ['online', 'Online', (t) => t.kind === 'online'],
  ];
  chips.replaceChildren(...defs.map(([key, label, test]) => {
    const n = trophies.filter((t) => test(t) && passesBase(t, state)).length;
    return h('button', {
      type: 'button', class: `chip ${key === 'missable' ? 'chip-miss' : ''} ${ui.kind === key ? 'on' : ''}`,
      dataset: { kind: key },
      onclick: () => { ui.kind = key; paint(); },
    }, label, h('b', {}, n));
  }));
}

/** Search / grade / hide-earned apply before kind counts are taken. */
function passesBase(t, state) {
  if (ui.grade !== 'all' && t.grade !== ui.grade) return false;
  if (ui.hideEarned && isEarned(t.id)) return false;
  const q = ui.search.trim().toLowerCase();
  if (q) {
    if (isMasked(t, state)) return false; // masked names are not searchable
    if (!(`${t.name} ${t.description}`.toLowerCase().includes(q))) return false;
  }
  return true;
}

function visible(trophies) {
  const state = getState();
  return trophies.filter((t) => {
    if (!passesBase(t, state)) return false;
    if (ui.kind === 'missable') return t.missable;
    if (ui.kind !== 'all' && t.kind !== ui.kind) return false;
    return true;
  });
}

function paint() {
  const { trophies, listWrap, paneWrap, note } = els;
  const state = getState();
  paintChips();
  const list = visible(trophies);
  note.textContent = `${list.length} of ${trophies.length} shown`;

  // Group by roadmap stage, keeping stage order.
  const nodes = [];
  for (const stage of STAGES) {
    const group = list.filter((t) => t.stage === stage.n);
    if (!group.length) continue;
    const all = trophies.filter((t) => t.stage === stage.n);
    const earned = all.filter((t) => isEarned(t.id)).length;
    nodes.push(h('div', { class: 'stage-band' },
      h('span', { class: 'band-num' }, stage.n),
      h('span', { class: 'band-title' }, stage.title),
      h('span', { class: 'band-chapter' }, stage.chapter),
      h('span', { class: 'band-count' }, `${earned}/${all.length}`)));
    nodes.push(...group.map((t) => row(t, state)));
  }
  listWrap.replaceChildren(...nodes);

  const sel = trophies.find((t) => t.id === ui.selected) ?? null;
  paneWrap.replaceChildren(renderGuidePane(sel));
}

function row(t, state) {
  const masked = isMasked(t, state);
  const earned = isEarned(t.id);
  const check = h('input', {
    type: 'checkbox', 'aria-label': `Mark ${masked ? 'hidden trophy' : t.name} earned`,
    onclick: (e) => e.stopPropagation(),
    onchange: () => toggleEarned(t.id),
  });
  check.checked = earned;

  const meta = h('div', { class: 'tmeta' });
  if (t.missable && !masked) meta.append(taglet('missable', 'missable'));
  if (!masked) meta.append(taglet(KIND_LABELS[t.kind], t.kind));
  if (t.psnTarget && !masked) {
    const v = counterValue(t.id);
    meta.append(h('span', { class: 'mini-count' }, countLabel(t, v)),
      h('span', { class: 'mini-bar' }, h('i', { style: `width:${pct(v, t.psnTarget)}%` })));
  }
  if (masked) meta.append(taglet('secret', 'hidden-t'));

  return h('div', {
    class: `trow ${earned ? 'earned' : ''} ${masked ? 'masked' : ''} ${ui.selected === t.id ? 'sel' : ''}`,
    onclick: () => { ui.selected = t.id; paint(); },
  },
    check, gradeDot(t.grade),
    h('div', { class: 'ttext' },
      h('div', { class: 'tname' }, masked ? 'Hidden trophy' : t.name),
      h('div', { class: 'tdesc' }, masked ? 'Secret on PlayStation — earn to reveal name, description and guide.' : t.description)),
    meta);
}

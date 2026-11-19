// Checklist page: search, kind/grade filters, hide-earned, the trophy list and the guide pane.
// Filter state lives here (UI state, not part of the save); progress lives in the store.

import { h, gradeDot, taglet, countLabel, pct } from './util.js';
import { getState, isEarned, toggleEarned, counterValue } from './store.js';
import { isMasked, KIND_LABELS } from './data.js';
import { renderGuidePane } from './guidepane.js';

const ui = { search: '', kind: 'all', grade: 'all', hideEarned: false, selected: 17 };
let els = null;

const KIND_FILTERS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Missable'],
  ['collectible', 'Collectibles'], ['activity', 'Activities'], ['online', 'Online'],
];

export function selectTrophy(id) { ui.selected = id; }

export function mountChecklist(root, trophies) {
  ui.hideEarned = getState().settings.hideEarned;
  const note = h('span', { class: 'result-note' });
  const search = h('input', {
    type: 'search', placeholder: 'Search trophies…', value: ui.search, 'data-focus': 'search',
    'aria-label': 'Search trophies',
    oninput: (e) => { ui.search = e.target.value; paint(); },
  });
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Kind filter' },
    KIND_FILTERS.map(([key, label]) => h('button', {
      type: 'button', class: `chip ${ui.kind === key ? 'on' : ''}`, dataset: { kind: key },
      onclick: () => { ui.kind = key; syncChips(chips); paint(); },
    }, label)));
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
  els = { trophies, listWrap, paneWrap, note };
  paint();
}

export function updateChecklist() { if (els) paint(); }

function syncChips(chips) {
  for (const c of chips.querySelectorAll('.chip')) c.classList.toggle('on', c.dataset.kind === ui.kind);
}

function visible(trophies) {
  const state = getState();
  const q = ui.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (ui.kind === 'missable') { if (!t.missable) return false; }
    else if (ui.kind !== 'all' && t.kind !== ui.kind) return false;
    if (ui.grade !== 'all' && t.grade !== ui.grade) return false;
    if (ui.hideEarned && isEarned(t.id)) return false;
    if (q) {
      if (isMasked(t, state)) return false; // masked names are not searchable
      if (!(`${t.name} ${t.description}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

function paint() {
  const { trophies, listWrap, paneWrap, note } = els;
  const state = getState();
  const list = visible(trophies);
  note.textContent = `${list.length} of ${trophies.length} shown`;
  listWrap.replaceChildren(...list.map((t) => row(t, state)));
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

  const meta = h('div', { class: 'tmeta' },
    taglet(KIND_LABELS[t.kind], t.kind),
    t.missable ? taglet('missable?', 'missable') : null);
  if (t.psnTarget && !masked) {
    const v = counterValue(t.id);
    meta.append(h('span', { class: 'mini-count' }, countLabel(t, v)),
      h('span', { class: 'mini-bar' }, h('i', { style: `width:${pct(v, t.psnTarget)}%` })));
  }
  if (t.hidden) meta.append(taglet('secret', 'hidden-t'));

  return h('div', {
    class: `trow ${earned ? 'earned' : ''} ${masked ? 'masked' : ''} ${ui.selected === t.id ? 'sel' : ''}`,
    onclick: () => { ui.selected = t.id; paint(); },
  },
    check, gradeDot(t.grade),
    h('div', {},
      h('div', { class: 'tname' }, masked ? 'Hidden Trophy' : t.name),
      h('div', { class: 'tdesc' }, masked ? 'Story trophy — earn to reveal name, description and guide.' : t.description)),
    meta);
}

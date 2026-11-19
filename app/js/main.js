// Bootstrap: load the local trophy data, render the progress header, route between
// pages by hash, and re-render on every save change while preserving input focus.

import { h, bar, pct } from './util.js';
import { getState, subscribe, isEarned } from './store.js';
import { loadTrophies, earnedCount, gradeCounts, missablesLeft, GRADES } from './data.js';
import { mountChecklist, updateChecklist } from './checklist.js';
import { mountRoadmap } from './roadmap.js';
import { mountMissables } from './missables.js';
import { mountPlanner } from './planner.js';
import { mountSettings, updateSettings } from './settings.js';

const view = document.getElementById('view');
const progressEl = document.getElementById('progress');
const nav = document.getElementById('nav');

let trophies = [];
let current = 'checklist';

const ROUTES = {
  checklist: { mount: mountChecklist, update: updateChecklist },
  roadmap: { mount: mountRoadmap },
  missables: { mount: mountMissables },
  planner: { mount: mountPlanner },
  settings: { mount: mountSettings, update: updateSettings },
};

function routeName() {
  const name = (location.hash.replace(/^#\/?/, '') || 'checklist').split('?')[0];
  return ROUTES[name] ? name : 'checklist';
}

function renderHeader() {
  const state = getState();
  const earned = earnedCount(trophies, state);
  const gc = gradeCounts(trophies, state);
  const miss = missablesLeft(trophies, state);
  const chip = (g, label) => h('span', { class: `gchip ${g}` }, `${label} `, h('b', {}, `${gc[g].earned}/${gc[g].total}`));
  progressEl.replaceChildren(
    h('span', { class: 'big' }, earned, h('small', {}, ' / 55 earned')),
    bar(earned, trophies.length),
    h('span', { class: 'grade-chips' }, chip('platinum', 'P'), chip('gold', 'G'), chip('silver', 'S'), chip('bronze', 'B')),
    h('span', { class: 'gchip', style: miss ? 'color:var(--danger)' : 'color:var(--ok)' },
      miss ? `${miss} missables left` : 'missables clear'));
}

function mountRoute() {
  current = routeName();
  for (const a of nav.querySelectorAll('a')) a.classList.toggle('on', a.dataset.route === current);
  view.replaceChildren();
  ROUTES[current].mount(view, trophies);
}

/** Re-render after a save change without stealing focus from inputs. */
function refresh() {
  const active = document.activeElement;
  const focusKey = active?.dataset?.focus;
  const selStart = active?.selectionStart;
  const selEnd = active?.selectionEnd;
  renderHeader();
  const route = ROUTES[current];
  if (route.update) route.update();
  else { view.replaceChildren(); route.mount(view, trophies); }
  if (focusKey) {
    const el = view.querySelector(`[data-focus="${focusKey}"]`);
    if (el) {
      el.focus();
      if (selStart != null && el.setSelectionRange) {
        try { el.setSelectionRange(selStart, selEnd); } catch { /* number inputs etc. */ }
      }
    }
  }
}

async function boot() {
  try {
    trophies = await loadTrophies();
  } catch (err) {
    view.replaceChildren(h('p', { class: 'msg err' }, `Could not load trophy data: ${err.message}`));
    return;
  }
  renderHeader();
  mountRoute();
  window.addEventListener('hashchange', mountRoute);
  subscribe(refresh);
}

boot();

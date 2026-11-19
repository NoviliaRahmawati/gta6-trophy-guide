// Bootstrap: load the local trophy data, render the progress header with the
// prominent spoiler toggle, route between pages by hash, and re-render on every
// save change while preserving input focus.

import { h, bar } from './util.js';
import { getState, subscribe, setSetting } from './store.js';
import { loadTrophies, earnedCount, gradeCounts, missablesLeft, maskedCount } from './data.js';
import { mountChecklist, updateChecklist } from './checklist.js';
import { mountRoadmap } from './roadmap.js';
import { mountMissables } from './missables.js';
import { mountPlanner } from './planner.js';
import { mountSettings, updateSettings } from './settings.js';

const view = document.getElementById('view');
const progressEl = document.getElementById('progress');
const shieldEl = document.getElementById('shield-toggle');
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
  const masked = maskedCount(trophies, state);
  const chip = (g, label) => h('span', { class: `gchip ${g}` }, `${label} `, h('b', {}, `${gc[g].earned}/${gc[g].total}`));
  progressEl.replaceChildren(
    h('span', { class: 'big' }, earned, h('small', {}, ' / 55 earned')),
    bar(earned, trophies.length),
    h('span', { class: 'grade-chips' }, chip('platinum', 'P'), chip('gold', 'G'), chip('silver', 'S'), chip('bronze', 'B')),
    h('span', { class: `gchip ${miss ? 'miss-chip' : 'ok-chip'}` },
      miss ? `⚠ ${miss} missable left` : 'missables clear'));

  shieldEl.replaceChildren(h('button', {
    type: 'button',
    class: `shield-btn ${state.settings.spoilerShield ? 'on' : 'off'}`,
    'aria-pressed': String(state.settings.spoilerShield),
    title: 'Toggle the spoiler shield',
    onclick: () => setSetting('spoilerShield', !state.settings.spoilerShield),
  }, state.settings.spoilerShield ? `🛡 Spoilers hidden — ${masked}` : '🛡 Spoilers shown'));
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

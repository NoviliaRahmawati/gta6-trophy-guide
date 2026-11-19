// Save & Settings page: spoiler shield with a live three-row preview,
// hide-earned default, export/import/reset, save statistics and the data sources.
// updateSettings() refreshes only the dynamic regions so the message line and
// file input survive save changes (import/reset report into the same nodes).

import { h, taglet } from './util.js';
import { getState, setSetting, exportSave, importSave, resetSave, saveStats, isEarned } from './store.js';
import { isMasked, maskedCount } from './data.js';

let els = null;

export function mountSettings(root, trophies) {
  const state = getState();
  const msg = h('div', { class: 'msg', role: 'status' });

  const shield = h('input', { type: 'checkbox', onchange: (e) => setSetting('spoilerShield', e.target.checked) });
  shield.checked = state.settings.spoilerShield;
  const hideEarned = h('input', { type: 'checkbox', onchange: (e) => setSetting('hideEarned', e.target.checked) });
  hideEarned.checked = state.settings.hideEarned;

  const previewWrap = h('div');
  const settingsPanel = h('section', { class: 'panel' },
    h('h2', {}, 'Settings'),
    h('div', { class: 'setrow' },
      h('label', { class: 'switch' }, shield, h('span', { class: 'track' })),
      h('div', {},
        h('div', { class: 's-title' }, 'Spoiler shield'),
        h('div', { class: 's-desc' }, 'PlayStation hides 28 of the 55 trophies until earned — every story beat included. The shield masks their names, descriptions and guides here too, until you tick them earned.'))),
    h('div', { class: 'setrow' },
      h('label', { class: 'switch' }, hideEarned, h('span', { class: 'track' })),
      h('div', {},
        h('div', { class: 's-title' }, 'Hide earned by default'),
        h('div', { class: 's-desc' }, 'Open the checklist already filtered to what is left.'))),
    h('h3', { class: 'mini-title' }, 'Shield preview — live'),
    previewWrap);

  const file = h('input', {
    type: 'file', accept: 'application/json,.json', id: 'import-file',
    onchange: async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const res = await importSave(f);
      msg.className = `msg ${res.ok ? 'ok' : 'err'}`;
      msg.textContent = res.message;
      e.target.value = '';
    },
  });

  const statsWrap = h('div');
  const savePanel = h('section', { class: 'panel' },
    h('h2', {}, 'Save data'),
    h('p', { class: 'page-intro' }, 'Progress autosaves to this browser’s localStorage on every change. Export a JSON backup or move it to another machine; import restores it exactly.'),
    statsWrap,
    h('div', { class: 'save-btns' },
      h('button', { type: 'button', class: 'btn primary', onclick: () => { exportSave(); msg.className = 'msg ok'; msg.textContent = 'Exported leonida-legend-save.json — keep it safe.'; } }, 'Export save'),
      h('label', { class: 'btn file-label', for: 'import-file' }, 'Import save'),
      file,
      h('button', {
        type: 'button', class: 'btn danger',
        onclick: () => { if (confirm('Reset all progress, counters, notes and settings?')) { resetSave(); msg.className = 'msg ok'; msg.textContent = 'Save reset.'; } },
      }, 'Reset')),
    msg,
    h('h3', { class: 'mini-title' }, 'About the data'),
    h('p', { class: 'page-intro' },
      'Official names, descriptions and grades: ',
      h('a', { href: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/', target: '_blank', rel: 'noopener' }, 'Exophase'),
      '. PSN counters and hidden flags: ',
      h('a', { href: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi', target: '_blank', rel: 'noopener' }, 'PSNProfiles'),
      '. Guides are our own words from launch-day research — PowerPyx, gta.guide, games.gg, gamemapa, Leonida Interactive, GamesHorizon and more, named beside each trophy. Unconfirmed triggers are labelled; nothing here is copied.'));

  root.append(h('div', { class: 'set-grid' }, settingsPanel, savePanel));
  els = { trophies, shield, hideEarned, previewWrap, statsWrap };
  paintDynamic();
}

/** Refresh stats, preview and switch positions without rebuilding the page. */
export function updateSettings() {
  if (!els) return;
  const state = getState();
  els.shield.checked = state.settings.spoilerShield;
  els.hideEarned.checked = state.settings.hideEarned;
  paintDynamic();
}

function paintDynamic() {
  const state = getState();
  const stats = saveStats();
  els.statsWrap.replaceChildren(
    h('div', { class: 'stat-line' }, h('span', {}, 'Trophies earned'), h('b', {}, `${stats.earned} / 55`)),
    h('div', { class: 'stat-line' }, h('span', {}, 'Counters in progress'), h('b', {}, stats.counters)),
    h('div', { class: 'stat-line' }, h('span', {}, 'Notes written'), h('b', {}, stats.notes)),
    h('div', { class: 'stat-line' }, h('span', {}, 'Queued trophies'), h('b', {}, stats.queued)),
    h('div', { class: 'stat-line' }, h('span', {}, 'Currently masked by shield'), h('b', {}, maskedCount(els.trophies, state))),
    h('div', { class: 'stat-line' }, h('span', {}, 'Save size'), h('b', {}, `${stats.bytes} bytes`)));
  els.previewWrap.replaceChildren(preview(els.trophies, state));
}

/** Three live sample rows: an earned reveal, a masked secret, a plain visible one. */
function preview(trophies, state) {
  const samples = [6, 13, 28].map((id) => trophies.find((t) => t.id === id)).filter(Boolean);
  return h('div', {}, samples.map((t) => {
    const masked = isMasked(t, state);
    return h('div', { class: 'preview-row' },
      taglet(t.grade),
      h('span', {}, masked ? 'Hidden trophy — earn to reveal' : t.name),
      isEarned(t.id) ? taglet('earned ✓', 'ok') : null,
      masked ? taglet('masked', 'hidden-t') : null);
  }));
}

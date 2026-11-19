// Save state: earned trophies, PSN counters, notes, settings and the planner queue.
// Persisted to localStorage only — no cookies, no network. Export/import is a plain JSON file.

const KEY = 'leonida-legend-save-v1';

function defaultState() {
  return {
    v: 1,
    earned: {},      // id -> ISO timestamp of when it was marked earned
    counters: {},    // id -> current value toward psnTarget
    notes: {},       // id -> free text
    settings: { spoilerShield: true, hideEarned: false },
    queue: [],       // planner: ordered trophy ids
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return sanitize(JSON.parse(raw)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

/** Accept only well-formed saves; drop anything suspicious. */
function sanitize(obj) {
  if (!obj || typeof obj !== 'object' || obj.v !== 1) return null;
  const s = defaultState();
  const idOk = (k) => /^\d+$/.test(k) && Number(k) >= 1 && Number(k) <= 55;
  if (obj.earned && typeof obj.earned === 'object') {
    for (const [k, v] of Object.entries(obj.earned)) if (idOk(k) && typeof v === 'string') s.earned[k] = v;
  }
  if (obj.counters && typeof obj.counters === 'object') {
    for (const [k, v] of Object.entries(obj.counters)) if (idOk(k) && Number.isFinite(v)) s.counters[k] = Math.max(0, Math.round(v));
  }
  if (obj.notes && typeof obj.notes === 'object') {
    for (const [k, v] of Object.entries(obj.notes)) if (idOk(k) && typeof v === 'string') s.notes[k] = v.slice(0, 4000);
  }
  if (obj.settings && typeof obj.settings === 'object') {
    s.settings.spoilerShield = obj.settings.spoilerShield !== false;
    s.settings.hideEarned = obj.settings.hideEarned === true;
  }
  if (Array.isArray(obj.queue)) s.queue = obj.queue.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55).slice(0, 55);
  return s;
}

let state = load();
const listeners = new Set();

export function getState() { return state; }

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function commit() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full/blocked: keep in-memory state */ }
  for (const fn of listeners) fn(state);
}

export function isEarned(id) { return Boolean(state.earned[id]); }

export function toggleEarned(id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = new Date().toISOString();
  commit();
}

/** Set a PSN counter; reaching the target auto-marks the trophy earned. */
export function setCounter(id, value, target) {
  const v = Math.max(0, Math.min(target, Math.round(Number(value) || 0)));
  state.counters[id] = v;
  if (v >= target && !state.earned[id]) state.earned[id] = new Date().toISOString();
  commit();
}

export function counterValue(id) { return state.counters[id] ?? 0; }

export function setNote(id, text) {
  const t = String(text ?? '').trim();
  if (t) state.notes[id] = t.slice(0, 4000);
  else delete state.notes[id];
  commit();
}

export function setSetting(name, value) {
  state.settings[name] = Boolean(value);
  commit();
}

export function addToQueue(id) {
  if (!state.queue.includes(id)) { state.queue.push(id); commit(); }
}

export function removeFromQueue(id) {
  state.queue = state.queue.filter((q) => q !== id);
  commit();
}

export function moveInQueue(id, dir) {
  const i = state.queue.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= state.queue.length) return;
  [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
  commit();
}

/** Download the whole save as a JSON file. */
export function exportSave() {
  const payload = { ...state, exportedAt: new Date().toISOString(), app: 'leonida-legend' };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h_download(url);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function h_download(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-save.json';
  return a;
}

/** Read an exported file back; returns {ok, message}. */
export async function importSave(file) {
  try {
    const text = await file.text();
    const next = sanitize(JSON.parse(text));
    if (!next) return { ok: false, message: 'That file is not a Leonida Legend save (expected version 1).' };
    state = next;
    commit();
    const n = Object.keys(state.earned).length;
    return { ok: true, message: `Imported: ${n} of 55 trophies earned, ${Object.keys(state.notes).length} notes.` };
  } catch {
    return { ok: false, message: 'Could not read that file as JSON.' };
  }
}

export function resetSave() {
  state = defaultState();
  commit();
}

export function saveStats() {
  return {
    earned: Object.keys(state.earned).length,
    counters: Object.keys(state.counters).length,
    notes: Object.keys(state.notes).length,
    queued: state.queue.length,
    bytes: JSON.stringify(state).length,
  };
}

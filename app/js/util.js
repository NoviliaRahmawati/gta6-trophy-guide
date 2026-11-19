// Shared DOM builders and formatters. No dependencies, no network.

/** Build an element: attributes, event handlers (on*), dataset, children. */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Escape text for the few places we assemble HTML strings. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** $250,000-style money. */
export function money(n) {
  return '$' + Number(n).toLocaleString('en-US');
}

/** Counter caption: money for the two cash trophies, plain numbers otherwise. */
export function countLabel(t, value) {
  const cash = t.id === 52 || t.id === 53;
  const fmt = cash ? money : (x) => Number(x).toLocaleString('en-US');
  return `${fmt(value)} / ${fmt(t.psnTarget)}`;
}

/** Percentage clamped to 0..100. */
export function pct(part, whole) {
  return whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;
}

/** Horizontal progress bar. */
export function bar(part, whole, cls = '') {
  return h('div', { class: `bar ${cls}`.trim(), role: 'progressbar', 'aria-valuenow': part, 'aria-valuemax': whole },
    h('i', { style: `width:${pct(part, whole)}%` }));
}

/** Coloured grade dot with a tooltip. */
export function gradeDot(grade) {
  return h('span', { class: `gdot ${grade}`, title: grade });
}

/** Small uppercase flag tag (kind, missable, secret…). */
export function taglet(text, cls = '') {
  return h('span', { class: `taglet ${cls}`.trim() }, text);
}

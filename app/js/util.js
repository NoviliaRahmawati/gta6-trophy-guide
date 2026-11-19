// Small DOM + formatting helpers shared by every view. No dependencies.

/** Create an element with attributes and children in one call. */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Escape text for the rare places we build HTML strings. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** $250,000-style money for the big counters. */
export function money(n) {
  return '$' + Number(n).toLocaleString('en-US');
}

/** Counter label: money for the two cash trophies, plain numbers otherwise. */
export function countLabel(t, value) {
  const cash = t.id === 52 || t.id === 53;
  const f = cash ? money : (x) => Number(x).toLocaleString('en-US');
  return `${f(value)} / ${f(t.psnTarget)}`;
}

/** Percentage clamped to 0..100, rounded. */
export function pct(part, whole) {
  return whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;
}

/** A progress bar element. */
export function bar(part, whole) {
  return h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': part, 'aria-valuemax': whole },
    h('i', { style: `width:${pct(part, whole)}%` }));
}

/** Grade badge dot. */
export function gradeDot(grade) {
  return h('span', { class: `gdot ${grade}`, title: grade });
}

/** Uppercase kind/flag taglets. */
export function taglet(text, cls = '') {
  return h('span', { class: `taglet ${cls}`.trim() }, text);
}

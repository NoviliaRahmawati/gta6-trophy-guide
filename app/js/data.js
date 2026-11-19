// Trophy data access plus the derived roadmap model: nine ordered stages built
// from the official descriptions and the cited launch-day guides, spoiler masking,
// progress math and Next-up suggestions.

export const KIND_LABELS = { story: 'Story', collectible: 'Collectible', activity: 'Activity', online: 'Online' };
export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
export const CONFIDENCE_LABELS = {
  confirmed: 'Guide-checked',
  reported: 'Reported — unverified',
  unknown: 'Trigger unknown',
};

/** The platinum road: chapters first (one-time moments taken as they appear),
 *  then the post-story free roam, then 100% and the platinum. */
export const STAGES = [
  { n: 1, title: 'Chapter 1 — Paradise keys', chapter: 'Ch 1',
    blurb: 'Gone Fishing, Cal, Kenton — and Lucia’s balcony meditation: it vanishes when Chapter 1 ends.' },
  { n: 2, title: 'Chapter 2 — Vice City arrival', chapter: 'Ch 2',
    blurb: 'Coffee Break unlocks duo roam, Bret and Billy. Daily Driver → garage app; Moses → Scooter Bros.' },
  { n: 3, title: 'Chapter 3 — Cartel money', chapter: 'Ch 3',
    blurb: 'Cartel Heist; Randy, Tyrone and Andy strands; Snap Gun (Yasmani) and Dye Pack Jammer (Credit Check).' },
  { n: 4, title: 'Chapter 4 — Ocean Beach rising', chapter: 'Ch 4',
    blurb: 'Child’s Play, Headliners, VCIA Takedown; the optional bank-vault mission; the E3/E4 airliner heist.' },
  { n: 5, title: 'Chapter 5 — The finale', chapter: 'Ch 5',
    blurb: 'Operation Savage Glory, then the finale. Free roam after the credits; keep chapter-boundary saves.' },
  { n: 6, title: 'Free roam — Collect & explore', chapter: 'Post-story',
    blurb: 'The 100% checklist opens (Progress > Stats). Card sets, WAiNK scans, vehicles, map fog, shopping.' },
  { n: 7, title: 'Free roam — Activities & scores', chapter: 'Post-story',
    blurb: 'Stunts, range golds, drone venues, races, challenges, arcade, Combat Focus, Strength, criminal profile.' },
  { n: 8, title: 'Free roam — Robberies & mischief', chapter: 'Post-story',
    blurb: 'Armored trucks, gang ops, the Mile Zero tank, Kingpin Bowling — plus secrets with unconfirmed triggers.' },
  { n: 9, title: 'The last mile — 100% & platinum', chapter: 'Platinum',
    blurb: '8 stranger strands, the 100% checklist (A Long Road), then Vice Got a Price! with the other 54.' },
];

/** Load the local trophy file (same-origin only; the app never touches the network). */
export async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error(`trophy data failed: ${res.status}`);
  const doc = await res.json();
  return doc.trophies;
}

/** Spoiler shield: the 28 trophies PlayStation hides (every story beat included)
 *  stay masked until earned. Non-hidden trophies are always visible. */
export function isMasked(t, state) {
  return state.settings.spoilerShield && t.hidden && !state.earned[t.id];
}

export function maskedCount(trophies, state) {
  return trophies.filter((t) => isMasked(t, state)).length;
}

export function earnedCount(trophies, state) {
  return trophies.filter((t) => state.earned[t.id]).length;
}

export function gradeCounts(trophies, state) {
  const out = {};
  for (const g of GRADES) {
    const all = trophies.filter((t) => t.grade === g);
    out[g] = { earned: all.filter((t) => state.earned[t.id]).length, total: all.length };
  }
  return out;
}

export function stageTrophies(trophies, n) {
  return trophies.filter((t) => t.stage === n);
}

export function stageProgress(trophies, state, n) {
  const list = stageTrophies(trophies, n);
  return { earned: list.filter((t) => state.earned[t.id]).length, total: list.length };
}

export function missablesLeft(trophies, state) {
  return trophies.filter((t) => t.missable && !state.earned[t.id]).length;
}

/** Next-up: unearned trophies, the missable first, then roadmap order. */
export function nextUp(trophies, state, limit = 5) {
  const pool = trophies.filter((t) => !state.earned[t.id]);
  pool.sort((a, b) =>
    (Number(b.missable) - Number(a.missable)) ||
    (a.stage - b.stage) ||
    (a.id - b.id));
  return pool.slice(0, limit).map((t) => ({ trophy: t, reason: suggestReason(t, state) }));
}

function suggestReason(t, state) {
  if (t.missable) return `Missable — ${t.missableInfo.window}. Do it before the window closes.`;
  if (t.psnTarget && (state.counters[t.id] ?? 0) > 0) return `Counter already moving (${state.counters[t.id]}/${t.psnTarget}) — keep it going.`;
  if (t.confidence === 'unknown') return 'Trigger unconfirmed — try it early and watch for the pop.';
  if (t.kind === 'story') return `Stage ${t.stage} story beat — unlocks as you play.`;
  if (t.kind === 'collectible') return `Stage ${t.stage} cleanup — sweep it with the map loop.`;
  return `Stage ${t.stage} activity — knock it out in free roam.`;
}
